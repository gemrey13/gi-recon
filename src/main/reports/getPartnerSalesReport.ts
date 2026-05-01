import { getDb } from "../utils";
import { PartnerSalesRow, ReportFilters } from "../types";

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
