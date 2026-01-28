import db from "../db";

export const dbService = {
  getPartnerReconData: (partner: "GRAB" | "PANDA", filters: any = {}) => {
    const isPanda = partner === "PANDA";
    const table = isPanda ? "foodpanda_transactions" : "grab_transactions";
    const idCol = isPanda ? "order_code" : "booking_id";
    const amtCol = isPanda ? "gross_amount" : "amount";
    const dateCol = isPanda ? "order_date" : "updated_on";
    const prefix = isPanda ? "P-" : "G-";

    let sql = `
      SELECT 
        -- Partner Data
        p.${idCol} as partner_id,
        p.${amtCol} as partner_amount,
        p.${dateCol} as partner_date,
        p.recon_status,
        -- POS Data (Linked via Matcher)
        pos.cusno as pos_cusno,
        pos.gross_amount as pos_amount,
        pos.order_date as pos_date
      FROM ${table} p
      LEFT JOIN pos_transactions pos ON pos.id = (
        SELECT id FROM pos_transactions 
        WHERE sanitize(cusno) = sanitize('${prefix}' || substr(p.${idCol}, -4))
        AND order_date = p.${dateCol}
        LIMIT 1
      )
      WHERE 1=1
    `;

    const params: any[] = [];
    if (filters.status && filters.status !== "ALL") {
      sql += ` AND p.recon_status = ?`;
      params.push(filters.status);
    }

    // 2. Date Range Filter (The Missing Part)
    if (filters.startDate && filters.startDate !== "") {
      sql += ` AND p.${dateCol} >= ?`;
      params.push(filters.startDate);
    }

    if (filters.endDate && filters.endDate !== "") {
      sql += ` AND p.${dateCol} <= ?`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY p.${dateCol} DESC`;

    return db.prepare(sql).all(...params);
  },

  getGlobalSummary: () => {
    const stats = db
      .prepare(
        `
    SELECT 
      COALESCE(SUM(CASE WHEN recon_status = 'MATCHED' THEN 1 ELSE 0 END), 0) as matched,
      COALESCE(SUM(CASE WHEN recon_status = 'FLAGGED' THEN 1 ELSE 0 END), 0) as flagged,
      COALESCE(SUM(CASE WHEN recon_status = 'unreconciled' THEN 1 ELSE 0 END), 0) as unreconciled
    FROM (
      SELECT recon_status FROM foodpanda_transactions
      UNION ALL
      SELECT recon_status FROM grab_transactions
    )
  `,
      )
      .get() as any;

    // Final fallback to ensure an object with 0s is ALWAYS returned
    return {
      matched: stats?.matched ?? 0,
      flagged: stats?.flagged ?? 0,
      unreconciled: stats?.unreconciled ?? 0,
    };
  },
};
