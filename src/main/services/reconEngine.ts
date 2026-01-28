import { db } from "../db";
import { sanitizeString, transformPartnerId } from "../utils/matchingLogic";

export async function runReconciliation() {
  console.log("Starting Reconciliation Engine...");

  // 1. Process FoodPanda
  const pandaRows: any = db.prepare("SELECT * FROM foodpanda_transactions WHERE recon_status = 'unreconciled'").all();
  for (const row of pandaRows) {
    const result = attemptMatch(row.order_code, row.gross_amount, row.order_date, 'PANDA');
    if (result) {
      updatePartnerStatus('foodpanda_transactions', row.id, result);
    }
  }

  // 2. Process Grab
  const grabRows: any = db.prepare("SELECT * FROM grab_transactions WHERE recon_status = 'unreconciled'").all();
  for (const row of grabRows) {
    const result = attemptMatch(row.booking_id, row.amount, row.updated_on, 'GRAB');
    if (result) {
      updatePartnerStatus('grab_transactions', row.id, result);
    }
  }

  console.log("Reconciliation Complete.");
}

/**
 * The tiered matching brain
 */
function attemptMatch(rawId: string, amount: number, date: string, type: 'GRAB' | 'PANDA') {
  const transform = transformPartnerId(rawId, type);
  const searchKey = transform.searchKey;
  const sortedKey = transform.sortedKey;

  // TIER 1: Exact ID + Exact Date + Exact Amount
  const tier1 = db.prepare(`
    SELECT id FROM pos_transactions 
    WHERE sanitize_func(cusno) = ? 
    AND order_date = ? 
    AND gross_amount = ?
  `).get(searchKey, date, amount) as any;

  if (tier1) return { status: 'MATCHED', type: 'EXACT' };

  // TIER 2: ID Match + Date Match (But Amount is different)
  const tier2 = db.prepare(`
    SELECT id FROM pos_transactions 
    WHERE sanitize_func(cusno) = ? 
    AND order_date = ?
  `).get(searchKey, date) as any;

  if (tier2) return { status: 'FLAGGED', type: 'PRICE_MISMATCH' };

  // TIER 3: Jumbled Characters (Anagram) + Date Match
  // We fetch all POS transactions for that day to check them one by one
  const dayPos = db.prepare("SELECT id, cusno, gross_amount FROM pos_transactions WHERE order_date = ?").all() as any[];
  
  for (const pos of dayPos) {
    const posClean = sanitizeString(pos.cusno).replace(/^[GP]-/, "");
    const posSorted = posClean.split('').sort().join('');

    if (posSorted === sortedKey) {
      const status = (pos.gross_amount === amount) ? 'MATCHED' : 'FLAGGED';
      return { status, type: 'JUMBLED' };
    }
  }

  return null; // No match found yet
}

/**
 * Updates the database with the result
 */
function updatePartnerStatus(table: string, id: number, result: { status: string, type: string }) {
  const stmt = db.prepare(`UPDATE ${table} SET recon_status = ? WHERE id = ?`);
  stmt.run(result.status, id);
}