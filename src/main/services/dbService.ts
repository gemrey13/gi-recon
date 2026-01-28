import db from '../db';

export const dbService = {
  // Logic for the Overview Stat Cards
  getReconSummary: () => {
    return db.prepare(`
      SELECT 
        SUM(CASE WHEN recon_status = 'MATCHED' THEN 1 ELSE 0 END) as matched,
        SUM(CASE WHEN recon_status = 'FLAGGED' THEN 1 ELSE 0 END) as flagged,
        SUM(CASE WHEN recon_status = 'unreconciled' THEN 1 ELSE 0 END) as unreconciled
      FROM (
        SELECT recon_status FROM foodpanda_transactions
        UNION ALL
        SELECT recon_status FROM grab_transactions
      )
    `).get();
  },

  // Logic for the Side-by-Side Table
  getPartnerData: (partner: 'GRAB' | 'PANDA') => {
    const isPanda = partner === 'PANDA';
    const table = isPanda ? 'foodpanda_transactions' : 'grab_transactions';
    const idCol = isPanda ? 'order_code' : 'booking_id';
    const amtCol = isPanda ? 'gross_amount' : 'amount';
    const dateCol = isPanda ? 'order_date' : 'updated_on';
    const prefix = isPanda ? 'P-' : 'G-';

    return db.prepare(`
      SELECT 
        p.${idCol} as partner_id,
        p.${amtCol} as partner_amount,
        p.${dateCol} as partner_date,
        p.recon_status,
        pos.cslipno as pos_id,
        pos.gross_amount as pos_amount
      FROM ${table} p
      LEFT JOIN pos_transactions pos ON pos.id = (
        SELECT id FROM pos_transactions 
        WHERE sanitize_func(cusno) = sanitize_func('${prefix}' || substr(p.${idCol}, -4))
        AND order_date = p.${dateCol}
        LIMIT 1
      )
    `).all();
  }
};