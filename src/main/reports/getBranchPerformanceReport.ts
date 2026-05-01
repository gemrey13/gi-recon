import { getDb } from "../utils";
import { BranchPerformanceRow, ReportFilters } from "../types";

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
