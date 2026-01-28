import { db } from "../db";
import { sanitizeString, transformPartnerId } from "./matchingLogic";

export async function findMatchInPos(partnerId: string, amount: number, date: string, partner: 'GRAB' | 'PANDA') {
  const transformation = transformPartnerId(partnerId, partner);
  
  // 1. TIER 1: EXACT MATCH (ID + DATE + AMOUNT)
  // This is the "Gold Standard" match.
  const exactMatch: any = db.prepare(`
    SELECT * FROM pos_transactions 
    WHERE sanitize_func(cusno) = ? 
    AND order_date = ? 
    AND gross_amount = ?
  `).get(transformation.searchKey, date, amount);

  if (exactMatch) return { status: 'MATCHED', posId: exactMatch.id, type: 'EXACT' };

  // 2. TIER 2: JUMBLED/TYPO MATCH (ID + DATE)
  // If we can't find an exact match, we look for jumbled characters on the same date.
  const dayTransactions: any = db.prepare(`
    SELECT * FROM pos_transactions WHERE order_date = ?
  `).all(date);

  for (const posRow of dayTransactions) {
    const sanitizedCusNo = sanitizeString(posRow.cusno);
    
    // Check if it's jumbled (sort the last 4 characters of the POS entry)
    const posLastFourSorted = sanitizedCusNo.replace(/^[GP]-/, "").split('').sort().join('');
    
    if (posLastFourSorted === transformation.sortedKey) {
      // It's a match, but check if amount is different
      const status = (posRow.gross_amount === amount) ? 'MATCHED' : 'FLAGGED';
      return { 
        status, 
        posId: posRow.id, 
        type: 'JUMBLED', 
        note: posRow.gross_amount !== amount ? 'Price Mismatch' : 'Character Typo' 
      };
    }
  }

  return { status: 'unreconciled', posId: null, type: 'NONE' };
}