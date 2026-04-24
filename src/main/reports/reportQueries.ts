import { getDb } from "../utils";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ReconSummaryRow {
  branch: string;
  branch_name: string;
  total_pos: number;
  matched: number;
  unmatched: number;
  exact_matches: number;
  tolerance_matches: number;
  manual_matches: number;
  match_rate: number;
  total_pos_amount: number;
  total_partner_amount: number;
  total_variance: number;
}

export interface DiscrepancyRow {
  branch: string;
  branch_name: string;
  partner_type: string;
  pos_cslipno: string;
  pos_amount: number;
  partner_amount: number;
  amount_difference: number;
  match_level: string;
  orddate: string;
}

export interface UnmatchedRow {
  id: number;
  branch: string;
  branch_name: string;
  partner_type: string;
  cslipno: string;
  orddate: string;
  totchrg: number;
}

export interface PartnerSalesRow {
  branch_name: string;
  partner_type: string;
  total_orders: number;
  gross_sales: number;
  commission_amt: number;
  withholding_tax: number;
  net_sales: number;
  total_fees: number;
}

export interface BranchPerformanceRow {
  branch: string;
  branch_name: string;
  pos_total: number;
  grab_total: number;
  panda_total: number;
  partner_total: number;
  total_variance: number;
  match_rate: number;
}

export interface ReportFilters {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  branch?: string; // pos_code
  partnerType?: "GRAB" | "PANDA" | "ALL";
}

// ─────────────────────────────────────────────
// 1. Reconciliation Summary Report
// ─────────────────────────────────────────────

export function getReconSummary(filters: ReportFilters = {}): ReconSummaryRow[] {
  const db = getDb();

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.dateFrom) {
    conditions.push("p.orddate >= ?");
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push("p.orddate <= ?");
    params.push(filters.dateTo);
  }
  if (filters.branch) {
    conditions.push("p.branch = ?");
    params.push(filters.branch);
  }
  if (filters.partnerType && filters.partnerType !== "ALL") {
    conditions.push("r.partner_type = ?");
    params.push(filters.partnerType);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT
      p.branch,
      COALESCE(
        CASE WHEN r.partner_type = 'GRAB' THEN bm.grab_name
             WHEN r.partner_type = 'PANDA' THEN bm.foodpanda_name
             ELSE bm.pos_name
        END,
        p.branch_name
      ) AS branch_name,
      COUNT(DISTINCT p.id)                                                      AS total_pos,
      COUNT(DISTINCT CASE WHEN r.recon_status = 'MATCHED' THEN p.id END)        AS matched,
      COUNT(DISTINCT CASE WHEN r.recon_status = 'UNMATCHED' OR r.id IS NULL THEN p.id END) AS unmatched,
      COUNT(DISTINCT CASE WHEN r.match_level = 'EXACT' THEN p.id END)           AS exact_matches,
      COUNT(DISTINCT CASE WHEN r.match_level = 'TOLERANCE' THEN p.id END)       AS tolerance_matches,
      COUNT(DISTINCT CASE WHEN r.match_level IN ('MANUAL_SINGLE','MANUAL_BATCH') THEN p.id END) AS manual_matches,
      ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN r.recon_status = 'MATCHED' THEN p.id END)
        / NULLIF(COUNT(DISTINCT p.id), 0),
        2
      )                                                                          AS match_rate,
      ROUND(SUM(DISTINCT p.totchrg), 2)                                         AS total_pos_amount,
      ROUND(SUM(CASE WHEN r.recon_status = 'MATCHED' THEN ABS(r.amount_difference) END), 2) AS total_variance
    FROM pos_transactions p
    LEFT JOIN recon_results r ON r.pos_id = p.id
    LEFT JOIN branch_mapping bm ON bm.pos_code = p.branch
    ${where}
    GROUP BY p.branch, COALESCE(
      CASE WHEN r.partner_type = 'GRAB' THEN bm.grab_name
           WHEN r.partner_type = 'PANDA' THEN bm.foodpanda_name
           ELSE bm.pos_name
      END,
      p.branch_name
    )
    ORDER BY branch_name
  `;

  return db.prepare(sql).all(...params) as ReconSummaryRow[];
}

// ─────────────────────────────────────────────
// 2. Discrepancy / Variance Report
// ─────────────────────────────────────────────

export function getDiscrepancyReport(filters: ReportFilters = {}): DiscrepancyRow[] {
  const db = getDb();

  const conditions: string[] = ["r.recon_status = 'MATCHED'", "ABS(r.amount_difference) > 0"];
  const params: unknown[] = [];

  if (filters.dateFrom) {
    conditions.push("p.orddate >= ?");
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push("p.orddate <= ?");
    params.push(filters.dateTo);
  }
  if (filters.branch) {
    conditions.push("p.branch = ?");
    params.push(filters.branch);
  }
  if (filters.partnerType && filters.partnerType !== "ALL") {
    conditions.push("r.partner_type = ?");
    params.push(filters.partnerType);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  const sql = `
    SELECT
      p.branch,
      CASE WHEN r.partner_type = 'GRAB' THEN bm.grab_name
           WHEN r.partner_type = 'PANDA' THEN bm.foodpanda_name
           ELSE p.branch_name
      END AS branch_name,
      r.partner_type,
      p.cslipno        AS pos_cslipno,
      p.totchrg        AS pos_amount,
      ROUND(p.totchrg + r.amount_difference, 2) AS partner_amount,
      ROUND(r.amount_difference, 2)              AS amount_difference,
      r.match_level,
      p.orddate
    FROM recon_results r
    JOIN pos_transactions p ON p.id = r.pos_id
    LEFT JOIN branch_mapping bm ON bm.pos_code = p.branch
    ${where}
    ORDER BY ABS(r.amount_difference) DESC, p.orddate DESC
  `;

  return db.prepare(sql).all(...params) as DiscrepancyRow[];
}

// ─────────────────────────────────────────────
// 3. Unmatched Transactions Report
// ─────────────────────────────────────────────

export function getUnmatchedReport(filters: ReportFilters = {}): UnmatchedRow[] {
  const db = getDb();

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.dateFrom) {
    conditions.push("p.orddate >= ?");
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push("p.orddate <= ?");
    params.push(filters.dateTo);
  }
  if (filters.branch) {
    conditions.push("p.branch = ?");
    params.push(filters.branch);
  }

  const where = conditions.length ? `AND ${conditions.join(" AND ")}` : "";

  // Unmatched POS: in recon_results with UNMATCHED, or not in recon_results at all
  const sql = `
    SELECT
      p.id,
      p.branch,
      COALESCE(
        CASE WHEN r.partner_type = 'GRAB' THEN bm.grab_name
             WHEN r.partner_type = 'PANDA' THEN bm.foodpanda_name
             ELSE bm.pos_name
        END,
        p.branch_name
      ) AS branch_name,
      CASE WHEN r.partner_type = 'GRAB' THEN bm.grab_name
           WHEN r.partner_type = 'PANDA' THEN bm.foodpanda_name
           ELSE COALESCE(bm.pos_name, p.branch_name)
      END AS branch_name,
      COALESCE(r.partner_type, 'N/A') AS partner_type,
      p.cslipno,
      p.orddate,
      p.totchrg
    FROM pos_transactions p
    LEFT JOIN recon_results r ON r.pos_id = p.id AND r.recon_status = 'UNMATCHED'
    LEFT JOIN branch_mapping bm ON bm.pos_code = p.branch
    WHERE (r.recon_status = 'UNMATCHED' OR r.id IS NULL)
    ${where}
    ORDER BY p.orddate DESC, branch_name
  `;

  return db.prepare(sql).all(...params) as UnmatchedRow[];
}

// ─────────────────────────────────────────────
// 4. Partner Sales Report
// ─────────────────────────────────────────────

export function getPartnerSalesReport(filters: ReportFilters = {}): PartnerSalesRow[] {
  const db = getDb();
  const results: PartnerSalesRow[] = [];

  const dateFrom = filters.dateFrom ?? "";
  const dateTo = filters.dateTo ?? "";

  // ── GRAB ──
  if (!filters.partnerType || filters.partnerType === "ALL" || filters.partnerType === "GRAB") {
    const grabConditions: string[] = ["g.status NOT IN ('CANCELLED','FAILED')"];
    const grabParams: unknown[] = [];

    if (dateFrom) {
      grabConditions.push("g.created_on >= ?");
      grabParams.push(dateFrom);
    }
    if (dateTo) {
      grabConditions.push("g.created_on <= ?");
      grabParams.push(dateTo);
    }

    const grabSql = `
      SELECT
        bm.pos_name        AS branch_name,
        'GRAB'             AS partner_type,
        COUNT(*)           AS total_orders,
        ROUND(SUM(g.amount), 2)         AS gross_sales,
        0.0                             AS commission_amt,
        ROUND(SUM(g.withholding_tax), 2) AS withholding_tax,
        ROUND(SUM(g.net_sales), 2)      AS net_sales,
        ROUND(SUM(g.grab_fee + COALESCE(g.tax_on_mdr, 0)), 2) AS total_fees
      FROM grab_transactions g
      JOIN branch_mapping bm ON bm.grab_name = g.store_name
      WHERE ${grabConditions.join(" AND ")}
      GROUP BY bm.pos_name
      ORDER BY bm.pos_name
    `;
    const grabRows = db.prepare(grabSql).all(...grabParams) as PartnerSalesRow[];
    results.push(...grabRows);
  }

  // ── PANDA ──
  if (!filters.partnerType || filters.partnerType === "ALL" || filters.partnerType === "PANDA") {
    const pandaConditions: string[] = ["fp.reversal IS NULL OR fp.reversal = ''"];
    const pandaParams: unknown[] = [];

    if (dateFrom) {
      pandaConditions.push("fp.order_date >= ?");
      pandaParams.push(dateFrom);
    }
    if (dateTo) {
      pandaConditions.push("fp.order_date <= ?");
      pandaParams.push(dateTo);
    }

    const pandaSql = `
      SELECT
        bm.pos_name         AS branch_name,
        'PANDA'             AS partner_type,
        COUNT(*)            AS total_orders,
        ROUND(SUM(fp.gross_food_value), 2)      AS gross_sales,
        ROUND(SUM(fp.commission_amt), 2)        AS commission_amt,
        ROUND(SUM(fp.expanded_withholding_tax), 2) AS withholding_tax,
        ROUND(SUM(fp.sales_revenue_net), 2)     AS net_sales,
        ROUND(SUM(fp.commission_amt + COALESCE(fp.tax_on_partner_charges, 0)), 2) AS total_fees
      FROM foodpanda_transactions fp
      JOIN branch_mapping bm ON bm.foodpanda_name = fp.partner_name
      WHERE ${pandaConditions.join(" AND ")}
      GROUP BY bm.pos_name
      ORDER BY bm.pos_name
    `;
    const pandaRows = db.prepare(pandaSql).all(...pandaParams) as PartnerSalesRow[];
    results.push(...pandaRows);
  }

  return results.sort((a, b) => a.branch_name.localeCompare(b.branch_name));
}

// ─────────────────────────────────────────────
// 5. Branch Performance Report
// ─────────────────────────────────────────────

export function getBranchPerformanceReport(filters: ReportFilters = {}): BranchPerformanceRow[] {
  const db = getDb();

  const posConditions: string[] = [];
  const posParams: unknown[] = [];

  if (filters.dateFrom) {
    posConditions.push("orddate >= ?");
    posParams.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    posConditions.push("orddate <= ?");
    posParams.push(filters.dateTo);
  }
  if (filters.branch) {
    posConditions.push("branch = ?");
    posParams.push(filters.branch);
  }

  const posWhere = posConditions.length ? `WHERE ${posConditions.join(" AND ")}` : "";

  const sql = `
    WITH pos_agg AS (
      SELECT
        p.branch,
        COALESCE(bm.pos_name, p.branch_name) AS branch_name,
        SUM(p.totchrg) AS pos_total,
        COUNT(*)        AS pos_count,
        COUNT(DISTINCT CASE WHEN r.recon_status = 'MATCHED' THEN p.id END) AS matched_count
      FROM pos_transactions p
      LEFT JOIN recon_results r ON r.pos_id = p.id
      LEFT JOIN branch_mapping bm ON bm.pos_code = p.branch
      ${posWhere}
      GROUP BY p.branch, COALESCE(bm.pos_name, p.branch_name)
    ),
    grab_agg AS (
      SELECT
        bm.pos_code,
        SUM(g.amount) AS grab_total
      FROM grab_transactions g
      JOIN branch_mapping bm ON bm.grab_name = g.store_name
      ${
        filters.dateFrom || filters.dateTo
          ? `WHERE ${[
              filters.dateFrom ? "g.created_on >= '" + filters.dateFrom + "'" : null,
              filters.dateTo ? "g.created_on <= '" + filters.dateTo + "'" : null,
            ]
              .filter(Boolean)
              .join(" AND ")}`
          : ""
      }
      GROUP BY bm.pos_code
    ),
    panda_agg AS (
      SELECT
        bm.pos_code,
        SUM(fp.gross_food_value) AS panda_total
      FROM foodpanda_transactions fp
      JOIN branch_mapping bm ON bm.foodpanda_name = fp.partner_name
      ${
        filters.dateFrom || filters.dateTo
          ? `WHERE ${[
              filters.dateFrom ? "fp.order_date >= '" + filters.dateFrom + "'" : null,
              filters.dateTo ? "fp.order_date <= '" + filters.dateTo + "'" : null,
            ]
              .filter(Boolean)
              .join(" AND ")}`
          : ""
      }
      GROUP BY bm.pos_code
    )
    SELECT
      pa.branch,
      pa.branch_name,
      ROUND(pa.pos_total, 2)                                         AS pos_total,
      ROUND(COALESCE(ga.grab_total, 0), 2)                          AS grab_total,
      ROUND(COALESCE(pda.panda_total, 0), 2)                        AS panda_total,
      ROUND(COALESCE(ga.grab_total, 0) + COALESCE(pda.panda_total, 0), 2) AS partner_total,
      ROUND(pa.pos_total - (COALESCE(ga.grab_total, 0) + COALESCE(pda.panda_total, 0)), 2) AS total_variance,
      ROUND(100.0 * pa.matched_count / NULLIF(pa.pos_count, 0), 2)  AS match_rate
    FROM pos_agg pa
    LEFT JOIN grab_agg ga   ON ga.pos_code  = pa.branch
    LEFT JOIN panda_agg pda ON pda.pos_code = pa.branch
    ORDER BY pa.branch_name
  `;

  return db.prepare(sql).all(...posParams) as BranchPerformanceRow[];
}

// ─────────────────────────────────────────────
// 6. System Logs Report
// ─────────────────────────────────────────────

export interface SystemLogRow {
  id: number;
  timestamp: string;
  level: string;
  module: string;
  action: string;
  message: string;
  description: string;
  user_name: string;
}

export function getSystemLogs(
  filters: {
    dateFrom?: string;
    dateTo?: string;
    level?: string;
    module?: string;
    limit?: number;
  } = {},
): SystemLogRow[] {
  const db = getDb();

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.dateFrom) {
    conditions.push("timestamp >= ?");
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push("timestamp <= ?");
    params.push(filters.dateTo + " 23:59:59");
  }
  if (filters.level) {
    conditions.push("level = ?");
    params.push(filters.level);
  }
  if (filters.module) {
    conditions.push("module = ?");
    params.push(filters.module);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = filters.limit ?? 500;

  return db
    .prepare(
      `
    SELECT * FROM system_logs ${where}
    ORDER BY timestamp DESC
    LIMIT ${limit}
  `,
    )
    .all(...params) as SystemLogRow[];
}
