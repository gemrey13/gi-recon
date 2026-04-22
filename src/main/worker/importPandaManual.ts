import Database from "better-sqlite3";
import * as XLSX from "xlsx";
import { formatString, toNumber, toSqliteDateTime } from "../utils";

export type ImportPandaManualOptions = {
  dbPath: string;
  filePath: string;
};

function mapRow(row: any) {
  return {
    official_doc_number: formatString(row["Official Document Number(A)"]),
    invoice_number: formatString(row["Invoice Number (B)"]),
    invoice_date: toSqliteDateTime(row["Invoice Date (C)"]),
    partner_name: formatString(row["Partner Name (D)"]),
    vendor_code: formatString(row["Vendor Code (E)"]),
    order_code: formatString(row["Order Code (F)"]),
    reversal: formatString(row["Reversal (G)"]),
    order_date: toSqliteDateTime(row["Order Date (H)"]),
    delivery_mode: formatString(row["Delivery Mode (I)"]),
    gross_food_value: toNumber(row["Gross Food Value / Product Value By Customer (J)"]),
    container_charges: toNumber(row["Container Charges Paid By Customer (K)"]),
    mov_paid_by_customer: toNumber(row["MOV Paid By Customer (L)"]),
    partner_delivery_fee: toNumber(row["Partner Delivery Fee Paid By Customer (M)"]),
    voucher_paid_by_vendor: toNumber(row["Voucher Paid By Vendor (N)"]),
    discount_paid_by_vendor: toNumber(row["Discount Paid By Vendor (O)"]),
    pandabox_voucher_vendor: toNumber(row["Pandabox Voucher Paid By Vendor (P)"]),
    sales_revenue_net: toNumber(row["Sales Revenue Via foodpanda After Partner Funded Discounts (Q) =J+K+L+M-N-O-P"]),
    withholding_tax_half_pct: toNumber(row["1/2% Withholding Tax (R)"]),
    waiting_time_fee: toNumber(row["Waiting Time Fee (S)"]),
    commission_base: toNumber(row["foodpanda Commission Base (T)"]),
    commission_pct: toNumber(row["foodpanda Commission Percentage (U)"]),
    commission_amt: toNumber(row["foodpanda Commission (V)"]),
    pandabox_fee: toNumber(row["Pandabox Fee Paid By Vendor (W)"]),
    customer_targeting_pct: toNumber(row["Customer Targeting Fee Percentage (X)"]),
    customer_targeting_fee: toNumber(row["Customer Targeting Fee Paid By Vendor (Y)"]),
    delivery_campaign_fee: toNumber(row["Delivery Fee Campaign Paid By Vendor (Z)"]),
    tax_on_partner_charges: toNumber(row["Tax On Partner Charges (AA) =(S+V+W+Y+Z)*12%"]),
    expanded_withholding_tax: toNumber(row["Expanded Withholding Tax (AB) = (V+W+Y)*2%"]),
    already_received_amt: toNumber(row["Already Received Amount By Vendor (AC)"]),
    balance_to_be_paid: toNumber(row["Balance to be paid to Partner (AD)= Q-R-S-V-W-Y-Z-AA+AB-AC"]),
  };
}

export function importPandaManual({ dbPath, filePath }: ImportPandaManualOptions) {
  const db = new Database(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
  `);

  const insertStmt = db.prepare(`
    INSERT INTO grab_transactions (
      merchant_name, merchant_id, store_name, store_id,
      updated_on, created_on, type, category, receiving_account,
      subcategory, status, transaction_id, linked_transaction_id,
      partner_transaction_id_1, partner_transaction_id_2,
      long_order_id, short_order_id, booking_id,
      order_channel, order_type, payment_method, terminal_id,
      channel, offer_type,
      grab_fee_percent, points_multiplier, points_issued,
      settlement_id, transfer_date,
      amount, tax_on_order_value, packaging_charge,
      non_member_fee, service_charge, offer,
      discount_merchant, delivery_fee_discount,
      delivery_charge_gos, delivery_charge_merchant,
      grabexpress_fee, net_sales, net_mdr,
      tax_on_mdr, grab_fee, marketing_success_fee,
      delivery_commission, channel_commission,
      order_commission, grabfood_other_commission,
      grabkitchen_commission, grabkitchen_other_commission,
      withholding_tax, total,
      cancellation_reason, cancelled_by,
      reason_for_refund, description,
      incident_group, incident_alias,
      customer_refund_item, appeal_link, appeal_status
    )
    VALUES (
      @merchant_name, @merchant_id, @store_name, @store_id,
      @updated_on, @created_on, @type, @category, @receiving_account,
      @subcategory, @status, @transaction_id, @linked_transaction_id,
      @partner_transaction_id_1, @partner_transaction_id_2,
      @long_order_id, @short_order_id, @booking_id,
      @order_channel, @order_type, @payment_method, @terminal_id,
      @channel, @offer_type,
      @grab_fee_percent, @points_multiplier, @points_issued,
      @settlement_id, @transfer_date,
      @amount, @tax_on_order_value, @packaging_charge,
      @non_member_fee, @service_charge, @offer,
      @discount_merchant, @delivery_fee_discount,
      @delivery_charge_gos, @delivery_charge_merchant,
      @grabexpress_fee, @net_sales, @net_mdr,
      @tax_on_mdr, @grab_fee, @marketing_success_fee,
      @delivery_commission, @channel_commission,
      @order_commission, @grabfood_other_commission,
      @grabkitchen_commission, @grabkitchen_other_commission,
      @withholding_tax, @total,
      @cancellation_reason, @cancelled_by,
      @reason_for_refund, @description,
      @incident_group, @incident_alias,
      @customer_refund_item, @appeal_link, @appeal_status
    )
    ON CONFLICT(booking_id) DO UPDATE SET
      updated_on = excluded.updated_on,
      total = excluded.total
  `);

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets["Transactions"];
  if (!sheet) throw new Error("Transactions sheet not found");

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  const transaction = db.transaction((rows: any[]) => {
    for (const row of rows) {
      if (!row["Booking ID"]) continue;
      insertStmt.run(mapRow(row));
    }
  });

  transaction(rows);

  const totalInserted = rows.length;

  console.log(`[Grab Manual Import] Total inserted: ${totalInserted}`);

  return {
    inserted: totalInserted,
  };
}
