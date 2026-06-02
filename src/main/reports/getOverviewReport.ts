import { getDb } from "../utils";
import {
  OverviewBranchRow,
  OverviewPartnerBreakdown,
  OverviewReport,
  OverviewTrendPoint,
  ReportFilters,
} from "../types";

export function getOverviewReport(filters: ReportFilters = {}): OverviewReport {
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

  const filterClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const totalsSql = `
    SELECT
      COUNT(DISTINCT p.id) AS total_transactions,
      COUNT(DISTINCT CASE WHEN r.recon_status = 'MATCHED' THEN p.id END) AS matched,
      COUNT(DISTINCT CASE WHEN r.recon_status = 'UNMATCHED' OR r.id IS NULL THEN p.id END) AS unreconciled,
      COUNT(DISTINCT CASE WHEN r.recon_status IS NULL OR r.recon_status != 'MATCHED' OR r.match_level IN ('MANUAL_SINGLE','MANUAL_BATCH','MANUAL_TOLERANCE') THEN p.id END) AS flagged,
      ROUND(SUM(p.totchrg), 2) AS total_amount,
      ROUND(SUM(COALESCE(r.amount_difference, 0)), 2) AS total_variance,
      ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN r.recon_status = 'MATCHED' THEN p.id END)
        / NULLIF(COUNT(DISTINCT p.id), 0),
        2
      ) AS overall_match_rate
    FROM pos_transactions p
    LEFT JOIN recon_results r ON r.pos_id = p.id
    ${filterClause}
  `;

  const partnerSql = `
    SELECT
      COALESCE(r.partner_type, 'UNMAPPED') AS partner_type,
      COUNT(DISTINCT p.id) AS total,
      COUNT(DISTINCT CASE WHEN r.recon_status = 'MATCHED' THEN p.id END) AS matched,
      ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN r.recon_status = 'MATCHED' THEN p.id END)
        / NULLIF(COUNT(DISTINCT p.id), 0),
        2
      ) AS match_rate
    FROM pos_transactions p
    LEFT JOIN recon_results r ON r.pos_id = p.id
    ${filterClause}
    GROUP BY COALESCE(r.partner_type, 'UNMAPPED')
    ORDER BY total DESC
  `;

  const trendSql = `
    SELECT
      date(p.orddate) AS day,
      COUNT(DISTINCT p.id) AS total,
      COUNT(DISTINCT CASE WHEN r.recon_status = 'MATCHED' THEN p.id END) AS matched,
      COUNT(DISTINCT CASE WHEN r.recon_status = 'UNMATCHED' OR r.id IS NULL THEN p.id END) AS unmatched,
      ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN r.recon_status = 'MATCHED' THEN p.id END)
        / NULLIF(COUNT(DISTINCT p.id), 0),
        2
      ) AS match_rate
    FROM pos_transactions p
    LEFT JOIN recon_results r ON r.pos_id = p.id
    ${filterClause}
    GROUP BY day
    ORDER BY day DESC
    LIMIT 14
  `;

  const branchesSql = `
    SELECT
      COALESCE(bm.pos_name, p.branch_name, p.branch) AS branch_name,
      COUNT(DISTINCT p.id) AS total,
      ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN r.recon_status = 'MATCHED' THEN p.id END)
        / NULLIF(COUNT(DISTINCT p.id), 0),
        2
      ) AS match_rate
    FROM pos_transactions p
    LEFT JOIN recon_results r ON r.pos_id = p.id
    LEFT JOIN branch_mapping bm ON bm.pos_code = p.branch
    ${filterClause}
    GROUP BY COALESCE(bm.pos_name, p.branch_name, p.branch)
    ORDER BY total DESC
    LIMIT 5
  `;

  const totals = db.prepare(totalsSql).get(...params) as Omit<OverviewReport, "partner_breakdown" | "daily_trend" | "top_branches">;
  const partnerBreakdown = db.prepare(partnerSql).all(...params) as OverviewPartnerBreakdown[];
  const dailyTrend = db.prepare(trendSql).all(...params) as OverviewTrendPoint[];
  const topBranches = db.prepare(branchesSql).all(...params) as OverviewBranchRow[];

  return {
    total_transactions: totals.total_transactions || 0,
    matched: totals.matched || 0,
    unreconciled: totals.unreconciled || 0,
    flagged: totals.flagged || 0,
    total_amount: totals.total_amount || 0,
    overall_match_rate: totals.overall_match_rate || 0,
    total_variance: totals.total_variance || 0,
    partner_breakdown: partnerBreakdown,
    daily_trend: dailyTrend.reverse(),
    top_branches: topBranches,
  };
}
