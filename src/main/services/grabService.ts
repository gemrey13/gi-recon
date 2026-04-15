import { databasePath } from "../utils";


/**
 * Executes reconciliation logic for Grab transactions
 * @param {string} dateFilter - Format 'YYYY-MM-DD'
 */
export const runGrabReconciliation = () => {
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

  try {
    return databasePath.prepare(query).all();
  } catch (error) {
    console.error("Database Error in grabService:", error);
    throw error;
  }
};

