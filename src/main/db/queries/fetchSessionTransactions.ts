import { Database } from "better-sqlite3";

export function fetchSessionTransactions(db: Database, sessionId: number) {
  const sql = `
    SELECT
      -- POS
      p.id AS pos_id,
      p.cusno,
      p.orddate,
      p.grschrg,
      p.promo_amt,
      p.balance,
      p.recon_status AS pos_status,

      -- GRAB
      g.id AS grab_id,
      g.booking_id,
      g.created_on,
      g.store_name,
      g.amount,
      g.discount_merchant_funded,
      g.net_sales,
      g.recon_status AS grab_status,
      g.variance,
      g.internal_notes

    FROM pos_transactions p
    LEFT JOIN grab_transactions g
      ON g.id = p.linked_grab_id

    WHERE p.session_id = ?
    ORDER BY p.id ASC
  `;

  return db.prepare(sql).all(sessionId);
}
