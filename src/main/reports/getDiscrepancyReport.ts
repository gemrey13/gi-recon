import { getDb } from "../utils";
import { DiscrepancyRow, ReportFilters } from "../types";

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
