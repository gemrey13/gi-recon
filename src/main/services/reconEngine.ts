import db from "../db";

/**
 * Registers the sanitizer function in SQLite to handle common OCR/Typing errors
 * like O instead of 0 or I instead of 1.
 */
function registerSanitizer() {
  try {
    db.function("sanitize", (str: string) => {
      if (!str) return "";
      return str.toUpperCase()
        .replace(/[0O]/g, "0")
        .replace(/[1I]/g, "1")
        .trim();
    });
  } catch (e) {
    // Function might already be registered
  }
}

export async function runReconciliation(partner: 'GRAB' | 'PANDA') {
  registerSanitizer();

  const isPanda = partner === 'PANDA';
  const table = isPanda ? 'foodpanda_transactions' : 'grab_transactions';
  const partnerId = isPanda ? 'order_code' : 'booking_id';
  const partnerAmt = isPanda ? 'gross_amount' : 'amount';
  const partnerDate = isPanda ? 'order_date' : 'updated_on';
  const prefix = isPanda ? 'P-' : 'G-';

  // WRAP IN A TRANSACTION FOR SPEED
  const performRecon = db.transaction(() => {
    /**
     * LOGIC:
     * 1. MATCHED: ID suffix + Date match, and Amount is identical.
     * 2. FLAGGED: ID suffix + Date match, but Amount is DIFFERENT.
     * 3. unreconciled: No match found in POS table.
     */
    
    const updateStmt = db.prepare(`
      UPDATE ${table}
      SET recon_status = (
        SELECT CASE 
          WHEN pos.gross_amount = ${table}.${partnerAmt} THEN 'MATCHED'
          ELSE 'FLAGGED'
        END
        FROM pos_transactions pos
        WHERE sanitize(pos.cusno) = sanitize('${prefix}' || substr(${table}.${partnerId}, -4))
        AND pos.order_date = ${table}.${partnerDate}
        LIMIT 1
      )
      WHERE EXISTS (
        SELECT 1 FROM pos_transactions pos
        WHERE sanitize(pos.cusno) = sanitize('${prefix}' || substr(${table}.${partnerId}, -4))
        AND pos.order_date = ${table}.${partnerDate}
      )
    `);

    return updateStmt.run();
  });

  return performRecon();
}