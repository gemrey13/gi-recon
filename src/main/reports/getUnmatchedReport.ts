import { getDb } from "../utils";
import { ReportFilters, UnmatchedRow } from "../types";

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

  if (filters.partnerType && filters.partnerType !== "ALL") {
    conditions.push("r.partner_type = ?");
    params.push(filters.partnerType);
  }


  const where = conditions.length ? `AND ${conditions.join(" AND ")}` : "";

  // Unmatched POS: in recon_results with UNMATCHED, or not in recon_results at all
  const sql = `
      SELECT
      p.id,
      p.branch,
      CASE WHEN r.partner_type = 'GRAB' THEN bm.grab_name
          WHEN r.partner_type = 'PANDA' THEN bm.foodpanda_name
          ELSE COALESCE(bm.pos_name, p.branch_name)
      END AS branch_name,
      COALESCE(r.partner_type, 'N/A') AS partner_type,
      p.cslipno,
      p.orddate,
      p.totchrg
    FROM recon_results r
    JOIN pos_transactions p ON p.id = r.pos_id
    LEFT JOIN branch_mapping bm ON bm.pos_code = p.branch
    WHERE r.recon_status = 'UNMATCHED'
      AND r.pos_id IS NOT NULL
      ${where}
    ORDER BY r.partner_type ASC, p.orddate DESC
  `;

  return db.prepare(sql).all(...params) as UnmatchedRow[];
}
