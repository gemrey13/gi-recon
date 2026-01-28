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
    db.prepare(`UPDATE ${table} SET recon_status = 'unreconciled', linked_pos_id = NULL`).run();

    /**
     * PASS 1: Strict Match (ID + Date + Exact Amount)
     * We use a "Correlated Subquery" to find exactly ONE available POS record.
     */
    db.prepare(
      `
      UPDATE ${table}
      SET 
        recon_status = 'MATCHED',
        linked_pos_id = (
          SELECT pos.id FROM pos_transactions pos
          WHERE sanitize(pos.cusno) = sanitize('${prefix}' || substr(${table}.${partnerId}, -4))
          AND pos.order_date = ${table}.${partnerDate}
          AND pos.gross_amount = ${table}.${partnerAmt}
          AND pos.status IS NULL
          LIMIT 1
        )
      WHERE EXISTS (
        SELECT 1 FROM pos_transactions pos
        WHERE sanitize(pos.cusno) = sanitize('${prefix}' || substr(${table}.${partnerId}, -4))
        AND pos.order_date = ${table}.${partnerDate}
        AND pos.gross_amount = ${table}.${partnerAmt}
        AND pos.status IS NULL
      )
    `,
    ).run();

    // Mark POS as claimed from Pass 1
    markPosClaimed(table, partner);

    /**
     * PASS 2: Discrepancy Match (ID + Date, but Amount differs)
     * Only runs for partner records that didn't find a perfect match in Pass 1.
     */
    db.prepare(
      `
      UPDATE ${table}
      SET 
        recon_status = 'FLAGGED',
        linked_pos_id = (
          SELECT pos.id FROM pos_transactions pos
          WHERE sanitize(pos.cusno) = sanitize('${prefix}' || substr(${table}.${partnerId}, -4))
          AND pos.order_date = ${table}.${partnerDate}
          AND pos.status IS NULL
          LIMIT 1
        )
      WHERE recon_status = 'unreconciled'
      AND EXISTS (
        SELECT 1 FROM pos_transactions pos
        WHERE sanitize(pos.cusno) = sanitize('${prefix}' || substr(${table}.${partnerId}, -4))
        AND pos.order_date = ${table}.${partnerDate}
        AND pos.status IS NULL
      )
    `,
    ).run();

    // Mark POS as claimed from Pass 2
    markPosClaimed(table, partner);

    return { status: true };
  });

  return performRecon();
}

/**
 * HELPER: Marks POS records as 'CLAIMED'
 * @param exactAmount - If true, only marks POS where amount is identical
 */
function markPosClaimed(table: string, partner: string) {
  db.prepare(
    `
    UPDATE pos_transactions
    SET status = ?
    WHERE id IN (
      SELECT linked_pos_id 
      FROM ${table} 
      WHERE linked_pos_id IS NOT NULL 
      AND recon_status IN ('MATCHED', 'FLAGGED')
    )
  `,
  ).run(partner);
}
