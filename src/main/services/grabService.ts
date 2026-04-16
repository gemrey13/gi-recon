import { databasePath } from "../utils";

/**
 * Reconciles Grab vs POS for a date range and specific branch.
 * @param startDate - 'YYYY-MM-DD'
 * @param endDate - 'YYYY-MM-DD'
 * @param branchName - The POS branch name (from your mapping table)
 */
export const runGrabReconciliation = (
  startDate: string = "2026-01-01",
  endDate?: string,
  branchName?: string,
) => {
  const finalEndDate = endDate || startDate;
  const isAllBranches = !branchName || branchName === "ALL";

  try {
    let posSql = `
      SELECT id, branch_name, orddate, grschrg as amount, cusname 
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
      SELECT g.id, g.store_name, g.created_on, g.amount, g.status, g.booking_id
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

    grabSql += ` AND g.status IN ('Cancelled', 'Completed', 'Transferred') AND g.category != 'Adjustment'`;

    const grabParams = isAllBranches
      ? [startDate, finalEndDate]
      : [startDate, finalEndDate, branchName];
    const grabEntries = databasePath.prepare(grabSql).all(...grabParams) as any[];

    let matchQuery = `
        SELECT 
            p.id AS pos_id, 
            g.id AS grab_id,
            p.grschrg AS amount,
            p.branch_name,
            p.orddate,
            g.status
        FROM grab_transactions g
        JOIN branch_mapping m ON g.store_name = m.grab_name
        JOIN pos_transactions p ON p.branch_name = m.pos_name
        WHERE g.category = 'Payment'
          AND g.status IN ('Completed', 'Transferred')
          AND p.orddate = date(g.created_on)
          AND (p.orddate BETWEEN ? AND ?)
          AND p.grschrg = g.amount
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

    return {
      matched: finalizedMatches,
      unmatchedPos,
      unmatchedGrab,
      range: { startDate, endDate: finalEndDate, branch: branchName || "ALL" },
    };
  } catch (error) {
    console.error("Database Error in grabService:", error);
    throw error;
  }
};
