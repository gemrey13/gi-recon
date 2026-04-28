import { getDb } from "../utils";
import { ReconSummaryRow, ReportFilters } from "../types";

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
      COUNT(DISTINCT CASE WHEN r.match_level = 'MANUAL_TOLERANCE' THEN p.id END)       AS tolerance_matches,
      COUNT(DISTINCT CASE WHEN r.match_level IN ('MANUAL_SINGLE','MANUAL_BATCH') THEN p.id END) AS manual_matches,
      ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN r.recon_status = 'MATCHED' THEN p.id END)
        / NULLIF(COUNT(DISTINCT p.id), 0),
        2
      )                                                                          AS match_rate,
      ROUND(SUM(p.totchrg), 2)                                         AS total_pos_amount,
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
