import { databasePath } from "../utils";

export const runGrabReconciliation = () => {
  const posEntries = databasePath
    .prepare(
      `
        SELECT id, branch_name, orddate, grschrg as amount, cusname 
        FROM pos_transactions 
        WHERE cusname LIKE '%GRAB%'
      `,
    )
    .all() as any[];

  const grabEntries = databasePath
    .prepare(
      `
        SELECT id, store_name, created_on, amount, status, booking_id
        FROM grab_transactions 
        WHERE status IN ('Cancelled', 'Completed', 'Transferred')
        AND category != 'Adjustment'
      `,
    )
    .all() as any[];

  const cancelled = databasePath
    .prepare(
      `
        SELECT id, store_name, created_on, amount, status, booking_id
        FROM grab_transactions 
        WHERE status IN ('Cancelled')
      `,
    )
    .all() as any[];

  const allGrabInPOS = databasePath
    .prepare(
      `
        SELECT * FROM pos_transactions 
        WHERE cusname LIKE '%GRAB%';
      `,
    )
    .all() as any[];

  const allGrabInGrabTransactions = databasePath
    .prepare(
      `
        SELECT * FROM grab_transactions;
      `,
    )
    .all() as any[];

  const query = `
        SELECT 
            p.id AS pos_id, 
            g.id AS grab_id,
            p.grschrg AS amount,
            p.branch_name,
            p.orddate,
            p.cusname,
            g.status
        FROM grab_transactions g
        JOIN branch_mapping m ON g.store_name = m.grab_name
        JOIN pos_transactions p ON p.branch_name = m.pos_name
        WHERE g.category = 'Payment'
          AND g.status IN ('Completed', 'Transferred')
          AND p.orddate = date(g.created_on)
          AND p.grschrg = g.amount
          AND p.cusname LIKE '%GRAB%'
    `;

  const processedGrabEntries = grabEntries.map((g) => ({
    ...g,
    is_batched: g.booking_id && g.booking_id.includes(", "), // Detect multiple IDs
    id_count: g.booking_id ? g.booking_id.split(", ").length : 1,
  }));

  // find all grab transactions that have two booking id like this A-8TXQLW2GX4SNAV, A-8TXQLHOGW5DVAV
  // 0010109696-C7XCCRAJEPUZDA, 001932906816-C7WVRBX1GUEAT6
  // 9a50e96e257a43d1a3ba954d9a0039af
  // A-8TXPVLJWWO8PAV
  // a31d1652c85948fe825454dc9aa5b93a

  try {
    const rawMatches = databasePath.prepare(query).all() as any[];

    const finalizedMatches: any[] = [];
    // Explicitly define the types here
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

    // const results = [finalizedMatches, unmatchedPos, unmatchedGrab, fetchAllGrab];

    const results = {
      matched: finalizedMatches,
      unmatchedPos: unmatchedPos,
      unmatchedGrab: unmatchedGrab,
      allGrabInPOS: allGrabInPOS,
      allGrabInGrabTransactions: allGrabInGrabTransactions,
      cancelled: cancelled,
    };

    return results;
  } catch (error) {
    console.error("Database Error in grabService:", error);
    throw error;
  }
};
