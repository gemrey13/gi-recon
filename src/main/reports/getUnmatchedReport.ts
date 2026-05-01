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
