import { getDb } from "../utils";
import { insertSystemLog } from "./logService";

/**
 * Reconciles Grab vs POS for a date range and specific branch.
 * @param startDate - 'YYYY-MM-DD'
 * @param endDate - 'YYYY-MM-DD'
 * @param branchName - The POS branch name (from your mapping table)
 */
export const runGrabReconciliation = (startDate: string, endDate?: string, branchName?: string) => {
  const finalEndDate = endDate || startDate;
  const isAllBranches = !branchName || branchName === "ALL";

  try {
    const databasePath = getDb();

    let posSql = `
      SELECT id, branch_name, orddate, grschrg as amount, cusname, cusno
      FROM pos_transactions 
      WHERE (orddate BETWEEN ? AND ?) AND cusname LIKE '%GRAB%'
    `;
    const posParams: any[] = [startDate, finalEndDate];

    if (!isAllBranches) {
      posSql += ` AND branch_name = ?`;
      posParams.push(branchName);
    }
    const posEntries = databasePath.prepare(posSql).all(...posParams) as any[];

    let grabSql = `
      SELECT g.id, g.store_name, g.created_on, g.amount, g.status, g.booking_id, g.category, g.short_order_id
      FROM grab_transactions g
    `;

    if (!isAllBranches) {
      // We join with mapping here to ensure we only fetch Grab rows that belong to the selected POS branch
      grabSql += `
        JOIN branch_mapping m ON g.store_name = m.grab_name
        WHERE (date(g.created_on) BETWEEN ? AND ?) AND m.pos_name = ?
      `;
    } else {
      grabSql += ` WHERE (date(g.created_on) BETWEEN ? AND ?)`;
    }

    grabSql += ` AND g.status IN ('Cancelled', 'Completed', 'Transferred')`;

    grabSql += ` ORDER BY g.category DESC, g.created_on DESC`;

    const grabParams = isAllBranches
      ? [startDate, finalEndDate]
      : [startDate, finalEndDate, branchName];
    const grabEntries = databasePath.prepare(grabSql).all(...grabParams) as any[];

    let matchQuery = `
        SELECT 
            p.id AS pos_id, 
            g.id AS grab_id,
            p.grschrg AS pos_amount, -- Specifically name these
            g.amount AS grab_amount,
            (p.grschrg - g.amount) AS amount_diff,
            p.branch_name,
            p.orddate,
            g.status
        FROM grab_transactions g
        JOIN branch_mapping m ON g.store_name = m.grab_name
        JOIN pos_transactions p ON p.branch_name = m.pos_name
        WHERE g.category IN ('Adjustment', 'Payment')
          AND g.status IN ('Completed', 'Transferred', 'Cancelled')
          AND p.orddate = date(g.created_on)
          AND (p.orddate BETWEEN ? AND ?)
          -- SENIOR MOVE: 0.05 tolerance (5 cents)
          AND abs(p.grschrg - g.amount) <= 0.05
          AND p.cusname LIKE '%GRAB%'
      `;

    if (!isAllBranches) {
      matchQuery += ` AND p.branch_name = ?`;
    }

    const matchParams = isAllBranches
      ? [startDate, finalEndDate]
      : [startDate, finalEndDate, branchName];
    const rawMatches = databasePath.prepare(matchQuery).all(...matchParams) as any[];

    const processedGrabEntries = grabEntries.map((g) => ({
      ...g,
      is_batched: g.booking_id && (g.booking_id.includes(",") || g.booking_id.includes(", ")),
      id_count: g.booking_id ? g.booking_id.split(/, ?/).length : 1,
    }));

    const finalizedMatches: any[] = [];
    const usedPosIds = new Set<number>();
    const usedGrabIds = new Set<number>();

    for (const match of rawMatches) {
      if (!usedPosIds.has(match.pos_id) && !usedGrabIds.has(match.grab_id)) {
        finalizedMatches.push(match);
        usedPosIds.add(match.pos_id);
        usedGrabIds.add(match.grab_id);
      }
    }

    const unmatchedPos = posEntries.filter((p) => !usedPosIds.has(p.id));
    const unmatchedGrab = processedGrabEntries.filter((g) => !usedGrabIds.has(g.id));

    insertSystemLog({
      level: "INFO",
      module: "GRAB_SERVICE",
      action: "RECON_RUN",
      message: "Reconciliation triggered",
      description: `Period: ${startDate} to ${finalEndDate}`,
      user_name: "System",
    });

    return {
      matched: finalizedMatches,
      unmatchedPos,
      unmatchedGrab,
      range: { startDate, endDate: finalEndDate, branch: branchName || "ALL" },
    };
  } catch (error: any) {
    console.error("Database Error in grabService:", error);
    insertSystemLog({
      level: "ERROR",
      module: "GRAB_SERVICE",
      action: "API_ERROR",
      message: "Failed to run Grab recon",
      description: error.message,
    });
    throw error;
  }
};

export const saveGrabReconciliationResults = (
  range: { startDate: string; endDate: string; branch: string },
  results: any,
) => {
  const databasePath = getDb();

  const { matched, unmatchedPos, unmatchedGrab } = results;
  const { startDate, endDate, branch } = range;
  const isAll = branch === "ALL";

  let deleteSql = `
    DELETE FROM recon_results_grab 
    WHERE (
      pos_id IN (
        SELECT id FROM pos_transactions 
        WHERE (orddate BETWEEN ? AND ?)
        ${isAll ? "" : "AND branch_name = ?"}
      ) 
      OR 
      grab_id IN (
        SELECT g.id FROM grab_transactions g
        ${isAll ? "" : "JOIN branch_mapping m ON g.store_name = m.grab_name"}
        WHERE (date(g.created_on) BETWEEN ? AND ?)
        ${isAll ? "" : "AND m.pos_name = ?"}
      )
    )
  `;

  const deleteParams = isAll
    ? [startDate, endDate, startDate, endDate]
    : [startDate, endDate, branch, startDate, endDate, branch];

  const insertStmt = databasePath.prepare(`
    INSERT INTO recon_results_grab (pos_id, grab_id, match_level, recon_status, amount_difference)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = databasePath.transaction(() => {
    databasePath.prepare(deleteSql).run(...deleteParams);

    // Save Matched
    for (const m of matched) {
      let matchLevel = m.match_level;

      if (!matchLevel) {
        const isExact = Math.abs(m.amount_diff || 0) < 0.001;
        matchLevel = isExact ? "EXACT" : "TOLERANCE";
      }

      insertStmt.run(
        m.pos_id,
        m.grab_id,
        matchLevel,
        "MATCHED",
        m.amount_diff || 0, // Save the actual 0.01 or -0.01 difference
      );
    }

    // Save Unmatched POS
    for (const p of unmatchedPos) {
      insertStmt.run(p.id, null, "NONE", "UNMATCHED", p.amount);
    }

    // Save Unmatched Grab
    for (const g of unmatchedGrab) {
      insertStmt.run(null, g.id, "NONE", "UNMATCHED", g.amount);
    }
  });

  try {
    transaction();

    insertSystemLog({
      level: "INFO",
      module: "GRAB_SERVICE",
      action: "RECON_SAVE",
      message: `Reconciliation finalized for ${branch}`,
      description: `Period: ${startDate} to ${endDate}. Matched: ${matched.length}, Unmatched POS: ${unmatchedPos.length}, Unmatched Grab: ${unmatchedGrab.length}`,
      user_name: "System",
    });

    return {
      success: true,
      message: `Reconciliation for ${branch} finalized (${startDate} to ${endDate}).`,
    };
  } catch (error: any) {
    console.error("Save Error in grabService:", error);

    insertSystemLog({
      level: "ERROR",
      module: "GRAB_SERVICE",
      action: "RECON_SAVE",
      message: `Failed to finalize reconciliation for ${branch}`,
      description: error.message || "Unknown database error during transaction",
      user_name: "System",
    });
    throw error;
  }
};
