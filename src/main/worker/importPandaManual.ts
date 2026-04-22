import Database from "better-sqlite3";
import * as XLSX from "xlsx";
import { pandaMapRow } from "../utils";

export type ImportPandaManualOptions = {
  dbPath: string;
  filePath: string;
};

export function importPandaManual({ dbPath, filePath }: ImportPandaManualOptions) {
  const db = new Database(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
  `);

  const insertStmt = db.prepare(`
    INSERT INTO foodpanda_transactions (
      official_doc_number, invoice_number, invoice_date, partner_name,
      vendor_code, order_code, reversal, order_date, delivery_mode,
      gross_food_value, container_charges, mov_paid_by_customer, partner_delivery_fee,
      voucher_paid_by_vendor, discount_paid_by_vendor,
      pandabox_voucher_vendor, sales_revenue_net, withholding_tax_half_pct,
      waiting_time_fee, commission_base, commission_pct, commission_amt,
      pandabox_fee, customer_targeting_pct,
      customer_targeting_fee, delivery_campaign_fee, tax_on_partner_charges,
      expanded_withholding_tax, already_received_amt,
      balance_to_be_paid
    )
    VALUES (
      @official_doc_number, @invoice_number, @invoice_date, @partner_name,
      @vendor_code, @order_code, @reversal, @order_date, @delivery_mode,
      @gross_food_value, @container_charges, @mov_paid_by_customer, @partner_delivery_fee,
      @voucher_paid_by_vendor, @discount_paid_by_vendor,
      @pandabox_voucher_vendor, @sales_revenue_net, @withholding_tax_half_pct,
      @waiting_time_fee, @commission_base, @commission_pct, @commission_amt,
      @pandabox_fee, @customer_targeting_pct,
      @customer_targeting_fee, @delivery_campaign_fee, @tax_on_partner_charges,
      @expanded_withholding_tax, @already_received_amt,
      @balance_to_be_paid
    )
    ON CONFLICT(order_code) DO UPDATE SET
      official_doc_number = excluded.official_doc_number,
      invoice_date = excluded.invoice_date,
      partner_name = excluded.partner_name,
      vendor_code = excluded.vendor_code,
      reversal = excluded.reversal,
      order_date = excluded.order_date,
      delivery_mode = excluded.delivery_mode,
      gross_food_value = excluded.gross_food_value,
      container_charges = excluded.container_charges,
      mov_paid_by_customer = excluded.mov_paid_by_customer,
      partner_delivery_fee = excluded.partner_delivery_fee,
      voucher_paid_by_vendor = excluded.voucher_paid_by_vendor,
      discount_paid_by_vendor = excluded.discount_paid_by_vendor,
      pandabox_voucher_vendor = excluded.pandabox_voucher_vendor,
      sales_revenue_net = excluded.sales_revenue_net,
      withholding_tax_half_pct = excluded.withholding_tax_half_pct,
      waiting_time_fee = excluded.waiting_time_fee,
      commission_base = excluded.commission_base,
      commission_pct = excluded.commission_pct,
      commission_amt = excluded.commission_amt,
      pandabox_fee = excluded.pandabox_fee,
      customer_targeting_pct = excluded.customer_targeting_pct,
      customer_targeting_fee = excluded.customer_targeting_fee,
      delivery_campaign_fee = excluded.delivery_campaign_fee,
      tax_on_partner_charges = excluded.tax_on_partner_charges,
      expanded_withholding_tax = excluded.expanded_withholding_tax,
      already_received_amt = excluded.already_received_amt,
      balance_to_be_paid = excluded.balance_to_be_paid
  `);

  const workbook = XLSX.readFile(filePath, { cellDates: true });

  const sheet = workbook.Sheets["Appendix A"];
  if (!sheet) throw new Error("Appendix A sheet not found");

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { raw: true });

  const transaction = db.transaction((rows: any[]) => {
    for (const row of rows) {
      if (!row["Order Code (F)"]) continue;
      insertStmt.run(pandaMapRow(row));
    }
  });

  transaction(rows);

  const totalInserted = rows.length;

  console.log(`[Panda Manual Import] Total inserted: ${totalInserted}`);

  return {
    inserted: totalInserted,
  };
}
