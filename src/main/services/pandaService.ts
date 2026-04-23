import { getDb } from "../utils";
import { insertSystemLog } from "./logService";

/**
 * Reconciles Grab vs POS for a date range and specific branch.
 * @param startDate - 'YYYY-MM-DD'
 * @param endDate - 'YYYY-MM-DD'
 * @param branchName - The POS branch name (from your mapping table)
 */
export const runPandaReconciliation = (
  startDate: string,
  endDate?: string,
  branchName?: string,
) => {
  const finalEndDate = endDate || startDate;
  const isAllBranches = !branchName || branchName === "ALL";

  try {
    const databasePath = getDb();

    let posSql = `
      SELECT id, branch_name, orddate, grschrg as amount, cusname, cusno
      FROM pos_transactions 
      WHERE (orddate BETWEEN ? AND ?) AND cusname LIKE '%PANDA%'
    `;
    const posParams: any[] = [startDate, finalEndDate];

    if (!isAllBranches) {
      posSql += ` AND branch_name = ?`;
      posParams.push(branchName);
    }
    const posEntries = databasePath.prepare(posSql).all(...posParams) as any[];

    let pandaSql =`
      SELECT f.id, f.partner_name, f.order_date, f.gross_food_value FROM foodpanda_transactions f
    `
    
    if (!isAllBranches) {
      pandaSql += `
        JOIN branch_mapping m ON f.partner_name = m.foodpanda_name
        WHERE (date(f.order_date) BETWEEN ? AND ?) AND m.pos_name = ?
      `
    } else {
      pandaSql += ` WHERE (date(f.order_date) BETWEEN ? AND ?)`;
    }

    pandaSql += ` ORDER BY f.order_date DESC, f.partner_name DESC`;

    const pandaParams = isAllBranches
      ? [startDate, finalEndDate]
      : [startDate, finalEndDate, branchName];
    const pandaEntries = databasePath.prepare(pandaSql).all(...pandaParams) as any[];

    let matchQuery = `
        SELECT 
            p.id AS pos_id, 
            f.id AS foodpanda_id,
            p.grschrg AS pos_amount,
            f.gross_food_value AS foodpanda_amount,
            (p.grschrg - f.gross_food_value) AS amount_diff,
            p.branch_name,
            p.orddate
        FROM foodpanda_transactions f
        JOIN branch_mapping m ON f.partner_name = m.foodpanda_name
        JOIN pos_transactions p ON p.branch_name = m.pos_name
        WHERE p.orddate = date(f.order_date)
          AND (p.orddate BETWEEN ? AND ?)
          -- SENIOR MOVE: 0.05 tolerance (5 cents)
          AND abs(p.grschrg - f.gross_food_value) <= 0.05
          AND p.cusname LIKE '%PANDA%'
      `;

    if (!isAllBranches) {
      matchQuery += ` AND p.branch_name = ?`;
    }

    const matchParams = isAllBranches
      ? [startDate, finalEndDate]
      : [startDate, finalEndDate, branchName];
    const rawMatches = databasePath.prepare(matchQuery).all(...matchParams) as any[];

    const finalizedMatches: any[] = [];
    const usedPosIds = new Set<number>();
    const usedPandaIds = new Set<number>();

    for (const match of rawMatches) {
      if (!usedPosIds.has(match.pos_id) && !usedPandaIds.has(match.foodpanda_id)) {
        finalizedMatches.push(match);
        usedPosIds.add(match.pos_id);
        usedPandaIds.add(match.foodpanda_id);
      }
    }

    const unmatchedPos = posEntries.filter((p) => !usedPosIds.has(p.id));
    const unmatchedPanda = pandaEntries.filter((f) => !usedPandaIds.has(f.id));

    insertSystemLog({
      level: "INFO",
      module: "PANDA_SERVICE",
      action: "RECON_RUN",
      message: "Reconciliation triggered",
      description: `Period: ${startDate} to ${finalEndDate}`,
      user_name: "System",
    });

    return {
      matched: finalizedMatches,
      unmatchedPos,
      unmatchedPanda,
      range: { startDate, endDate: finalEndDate, branch: branchName || "ALL" },
    };
  } catch (error: any) {
    console.error("Database Error in pandaService:", error);
    insertSystemLog({
      level: "ERROR",
      module: "PANDA_SERVICE",
      action: "API_ERROR",
      message: "Failed to run Panda recon",
      description: error.message,
    });
    throw error;
  }
};

export const savePandaReconciliationResults = (
  range: { startDate: string; endDate: string; branch: string },
  results: any,
) => {
  const databasePath = getDb();

  const { matched, unmatchedPos, unmatchedPanda } = results;
  const { startDate, endDate, branch } = range;
  const isAll = branch === "ALL";

  let deleteSql = `
    DELETE FROM recon_results_panda 
    WHERE (
      pos_id IN (
        SELECT id FROM pos_transactions 
        WHERE (orddate BETWEEN ? AND ?)
        ${isAll ? "" : "AND branch_name = ?"}
      ) 
      OR 
      panda_id IN (
        SELECT f.id FROM foodpanda_transactions f
        ${isAll ? "" : "JOIN branch_mapping m ON f.partner_name = m.foodpanda_name"}
        WHERE (date(f.order_date) BETWEEN ? AND ?)
        ${isAll ? "" : "AND m.pos_name = ?"}
      )
    )
  `;

  const deleteParams = isAll
    ? [startDate, endDate, startDate, endDate]
    : [startDate, endDate, branch, startDate, endDate, branch];

  const insertStmt = databasePath.prepare(`
    INSERT INTO recon_results_panda (pos_id, panda_id, match_level, recon_status, amount_difference)
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
        m.panda_id,
        matchLevel,
        "MATCHED",
        m.amount_diff || 0, // Save the actual 0.01 or -0.01 difference
      );
    }

    // Save Unmatched POS
    for (const p of unmatchedPos) {
      insertStmt.run(p.id, null, "NONE", "UNMATCHED", p.amount);
    }

    // Save Unmatched Panda
    for (const f of unmatchedPanda) {
      insertStmt.run(null, f.id, "NONE", "UNMATCHED", f.amount);
    }
  });

  try {
    transaction();

    insertSystemLog({
      level: "INFO",
      module: "PANDA_SERVICE",
      action: "RECON_SAVE",
      message: `Reconciliation finalized for ${branch}`,
      description: `Period: ${startDate} to ${endDate}. Matched: ${matched.length}, Unmatched POS: ${unmatchedPos.length}, Unmatched Grab: ${unmatchedPanda.length}`,
      user_name: "System",
    });

    return {
      success: true,
      message: `Reconciliation for ${branch} finalized (${startDate} to ${endDate}).`,
    };
  } catch (error: any) {
    console.error("Save Error in pandaService:", error);

    insertSystemLog({
      level: "ERROR",
      module: "PANDA_SERVICE",
      action: "RECON_SAVE",
      message: `Failed to finalize reconciliation for ${branch}`,
      description: error.message || "Unknown database error during transaction",
      user_name: "System",
    });
    throw error;
  }
};
