import db from "../db";

export const dbService = {
  getPartnerReconData: (partner: "GRAB" | "PANDA", filters: any = {}) => {
    const isPanda = partner === "PANDA";
    const table = isPanda ? "foodpanda_transactions" : "grab_transactions";
    const idCol = isPanda ? "order_code" : "booking_id";
    const amtCol = isPanda ? "gross_amount" : "amount";
    const dateCol = isPanda ? "order_date" : "updated_on";

    let sql = `
      SELECT 
        -- Partner Data
        p.${idCol} as partner_id,
        p.${amtCol} as partner_amount,
        p.${dateCol} as partner_date,
        p.recon_status,
        p.internal_notes,
        -- POS Data (Joined via the permanent linked_pos_id)
        pos.cusno as pos_cusno,
        pos.gross_amount as pos_amount,
        pos.order_date as pos_date,
        pos.cslipno as pos_slip
      FROM ${table} p
      LEFT JOIN pos_transactions pos ON p.linked_pos_id = pos.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // 1. Status Filter
    if (filters.status && filters.status !== "ALL") {
      sql += ` AND p.recon_status = ?`;
      params.push(filters.status);
    }

    // 2. Date Range Filter (Using the standardized YYYY-MM-DD format)
    if (filters.startDate && filters.startDate !== "") {
      sql += ` AND p.${dateCol} >= ?`;
      params.push(filters.startDate);
    }

    if (filters.endDate && filters.endDate !== "") {
      sql += ` AND p.${dateCol} <= ?`;
      params.push(filters.endDate);
    }

    // 3. Optional: Filter for Unlinked only (useful for finding missing entries)
    if (filters.unlinkedOnly === true) {
      sql += ` AND p.linked_pos_id IS NULL`;
    }

    sql += ` ORDER BY p.${dateCol} DESC`;

    return db.prepare(sql).all(...params);
  },

  getGlobalSummary: () => {
    const stats = db
      .prepare(
        `
    SELECT 
      SUM(CASE WHEN recon_status = 'MATCHED' THEN 1 ELSE 0 END) as matched,
      SUM(CASE WHEN recon_status = 'FLAGGED' THEN 1 ELSE 0 END) as flagged,
      SUM(CASE WHEN recon_status = 'unreconciled' THEN 1 ELSE 0 END) as unreconciled
    FROM (
      SELECT recon_status FROM foodpanda_transactions
      UNION ALL
      SELECT recon_status FROM grab_transactions
    )
  `,
      )
      .get() as any;

    return {
      matched: stats?.matched ?? 0,
      flagged: stats?.flagged ?? 0,
      unreconciled: stats?.unreconciled ?? 0,
    };
  },
};