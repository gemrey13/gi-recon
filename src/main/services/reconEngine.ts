import db from "../db";

export async function runReconciliation(partner: "GRAB" | "PANDA") {
  const isPanda = partner === "PANDA";
  const table = isPanda ? "foodpanda_transactions" : "grab_transactions";
  const partnerId = isPanda ? "order_code" : "booking_id";
  const partnerAmt = isPanda ? "gross_amount" : "amount";
  const partnerDate = isPanda ? "order_date" : "updated_on";
  const prefix = isPanda ? "P-" : "G-";

  const performRecon = db.transaction(() => {
    // 0. RESET
    db.prepare(`UPDATE pos_transactions SET status = NULL WHERE status = ?`).run(partner);
    db.prepare(`UPDATE ${table} SET recon_status = 'unreconciled'`).run();

    /**
     * PASS 1: Strict Match (ID + Date + Exact Amount)
     * We use a "Correlated Subquery" to find exactly ONE available POS record.
     */
    db.prepare(
      `
      UPDATE ${table}
      SET recon_status = 'MATCHED'
      WHERE id IN (
        SELECT p.id FROM ${table} p
        WHERE EXISTS (
          SELECT 1 FROM pos_transactions pos
          WHERE sanitize(pos.cusno) = sanitize('${prefix}' || substr(p.${partnerId}, -4))
          AND pos.order_date = p.${partnerDate}
          AND pos.gross_amount = p.${partnerAmt}
          AND pos.status IS NULL
        )
      )
    `,
    ).run();

    // Lock POS records matched in Pass 1
    markPosClaimed(table, partnerId, partnerDate, partner, true);

    /**
     * PASS 2: Discrepancy Match (ID + Date, but Amount differs)
     * Only runs for partner records that didn't find a perfect match in Pass 1.
     */
    db.prepare(
      `
      UPDATE ${table}
      SET recon_status = 'FLAGGED'
      WHERE recon_status = 'unreconciled'
      AND id IN (
        SELECT p.id FROM ${table} p
        WHERE EXISTS (
          SELECT 1 FROM pos_transactions pos
          WHERE sanitize(pos.cusno) = sanitize('${prefix}' || substr(p.${partnerId}, -4))
          AND pos.order_date = p.${partnerDate}
          AND pos.status IS NULL
        )
      )
    `,
    ).run();

    // Lock POS records matched in Pass 2
    markPosClaimed(table, partnerId, partnerDate, partner, false);

    return { status: "success" };
  });

  return performRecon();
}

/**
 * HELPER: Marks POS records as 'CLAIMED'
 * @param exactAmount - If true, only marks POS where amount is identical
 */
function markPosClaimed(
  table: string,
  partnerId: string,
  partnerDate: string,
  partner: string,
  exactAmount: boolean,
) {
  const prefix = partner === "PANDA" ? "P-" : "G-";
  const amountCondition = exactAmount
    ? `AND pos.gross_amount = p.${partner === "PANDA" ? "gross_amount" : "amount"}`
    : "";

  db.prepare(
    `
    UPDATE pos_transactions
    SET status = ?
    WHERE id IN (
      SELECT pos.id 
      FROM pos_transactions pos
      JOIN ${table} p ON sanitize(pos.cusno) = sanitize('${prefix}' || substr(p.${partnerId}, -4))
      AND pos.order_date = p.${partnerDate}
      ${amountCondition}
      WHERE p.recon_status IN ('MATCHED', 'FLAGGED')
      AND pos.status IS NULL
    )
  `,
  ).run(partner);
}
