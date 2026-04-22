import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

let _db: Database.Database | null = null;

export const getDb = () => {
  if (!_db) {
    const dbPath = path.join(app.getPath("userData"), "pos.db");
    _db = new Database(dbPath);
    _db.pragma("journal_mode = WAL");
  }
  return _db;
};

export function toNumber(v: any): number {
  if (!v) return 0;
  const num = Number(String(v).replace(/,/g, "").trim());
  return isNaN(num) ? 0 : num;
}

export function formatString(v: any) {
  if (v == null) return null;
  return String(v).trim();
}

export function toSqliteDateTime(v: any, includeTime: boolean = false): string | null {
  if (!v) return null;

  const date = v instanceof Date ? v : new Date(v);
  if (isNaN(date.getTime())) return null;

  // Date parts (YYYY-MM-DD)
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const dateString = `${yyyy}-${mm}-${dd}`;

  if (includeTime) {
    // Time parts (HH:MM:SS) 24-hour format for SQLite
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${dateString} ${hh}:${min}:${ss}`;
  }

  return dateString;
}

export function grabMapRow(row: any) {
  return {
    merchant_name: formatString(row["Merchant Name"]),
    merchant_id: formatString(row["Merchant ID"]),
    store_name: formatString(row["Store Name"]),
    store_id: formatString(row["Store ID"]),
    updated_on: toSqliteDateTime(row["Updated On"], true),
    created_on: toSqliteDateTime(row["Created On"], true),
    type: formatString(row["Type"]),
    category: formatString(row["Category"]),
    receiving_account: formatString(row["Receiving account / Source of fund"]),
    subcategory: formatString(row["Subcategory"]),
    status: formatString(row["Status"]),
    transaction_id: formatString(row["Transaction ID"]),
    linked_transaction_id: formatString(row["Linked Transaction ID"]),
    partner_transaction_id_1: formatString(row["Partner transaction ID 1"]),
    partner_transaction_id_2: formatString(row["Partner transaction ID 2"]),
    long_order_id: formatString(row["Long Order ID"]),
    short_order_id: formatString(row["Short Order ID"]),
    booking_id: formatString(row["Booking ID"]),
    order_channel: formatString(row["Order Channel"]),
    order_type: formatString(row["Order Type"]),
    payment_method: formatString(row["Payment Method"]),
    terminal_id: formatString(row["Terminal ID"]),
    channel: formatString(row["Channel"]),
    offer_type: formatString(row["Offer Type"]),

    grab_fee_percent: toNumber(row["Grab Fee (%)"]),
    points_multiplier: toNumber(row["Points Multiplier"]),
    points_issued: toNumber(row["Points Issued"]),
    settlement_id: formatString(row["Settlement ID"]),
    transfer_date: toSqliteDateTime(row["Transfer Date"], true),

    amount: toNumber(row["Amount"]),
    tax_on_order_value: toNumber(row["Tax on Order Value"]),
    packaging_charge: toNumber(row["Restaurant Packaging Charge"]),
    non_member_fee: toNumber(row["Non-Member Fee"]),
    service_charge: toNumber(row["Restaurant Service Charge"]),
    offer: toNumber(row["Offer"]),
    discount_merchant: toNumber(row["Discount (Merchant-Funded)"]),
    delivery_fee_discount: toNumber(row["Delivery Fee Discount (Merchant-Funded)"]),
    delivery_charge_gos: toNumber(row["Delivery Charge (Grab Online Store)"]),
    delivery_charge_merchant: toNumber(row["Delivery Charge (Merchant Delivery)"]),
    grabexpress_fee: toNumber(row["GrabExpress Delivery Service Fee"]),
    net_sales: toNumber(row["Net Sales"]),
    net_mdr: toNumber(row["Net MDR"]),
    tax_on_mdr: toNumber(row["Tax on MDR"]),
    grab_fee: toNumber(row["Grab Fee"]),
    marketing_success_fee: toNumber(row["Marketing success fee"]),
    delivery_commission: toNumber(row["Delivery Commission"]),
    channel_commission: toNumber(row["Channel Commission"]),
    order_commission: toNumber(row["Order commission"]),
    grabfood_other_commission: toNumber(row["GrabFood / GrabMart Other Commission"]),
    grabkitchen_commission: toNumber(row["GrabKitchen Commission"]),
    grabkitchen_other_commission: toNumber(row["GrabKitchen Other Commission"]),
    withholding_tax: toNumber(row["Withholding Tax"]),
    total: toNumber(row["Total"]),

    cancellation_reason: formatString(row["Cancellation Reason"]),
    cancelled_by: formatString(row["Cancelled by"]),
    reason_for_refund: formatString(row["Reason for Refund"]),
    description: formatString(row["Description"]),
    incident_group: formatString(row["Incident group"]),
    incident_alias: formatString(row["Incident alias"]),
    customer_refund_item: formatString(row["Customer refund Item"]),
    appeal_link: formatString(row["Appeal link"]),
    appeal_status: formatString(row["Appeal status"]),
  };
}

export function toPandaSqliteDateTime(v: any, includeTime: boolean = false): string | null {
  if (!v) return null;

  const date = v instanceof Date ? v : new Date(v);
  if (isNaN(date.getTime())) return null;

  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * -60000);
  const rounded = new Date(Math.round(localDate.getTime() / 86400000) * 86400000);

  const yyyy = rounded.getUTCFullYear();
  const mm = String(rounded.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(rounded.getUTCDate()).padStart(2, "0");
  const dateString = `${yyyy}-${mm}-${dd}`;

  if (includeTime) {
    const hh = String(localDate.getUTCHours()).padStart(2, "0");
    const min = String(localDate.getUTCMinutes()).padStart(2, "0");
    const ss = String(localDate.getUTCSeconds()).padStart(2, "0");
    return `${dateString} ${hh}:${min}:${ss}`;
  }

  return dateString;
}

export function pandaMapRow(row: any) {
  return {
    official_doc_number: formatString(row["Official Document Number(A)"]),
    invoice_number: formatString(row["Invoice Number (B)"]),
    invoice_date: toPandaSqliteDateTime(row["Invoice Date (C)"]),
    partner_name: formatString(row["Partner Name (D)"]),
    vendor_code: formatString(row["Vendor Code (E)"]),
    order_code: formatString(row["Order Code (F)"]),
    reversal: formatString(row["Reversal (G)"]),
    order_date: toPandaSqliteDateTime(row["Order Date (H)"]),
    delivery_mode: formatString(row["Delivery Mode (I)"]),
    gross_food_value: toNumber(row["Gross Food Value / Product Value By Customer (J)"]),
    container_charges: toNumber(row["Container Charges Paid By Customer (K)"]),
    mov_paid_by_customer: toNumber(row["MOV Paid By Customer (L)"]),
    partner_delivery_fee: toNumber(row["Partner Delivery Fee Paid By Customer (M)"]),
    voucher_paid_by_vendor: toNumber(row["Voucher Paid By Vendor (N)"]),
    discount_paid_by_vendor: toNumber(row["Discount Paid By Vendor (O)"]),
    pandabox_voucher_vendor: toNumber(row["Pandabox Voucher Paid By Vendor (P)"]),
    sales_revenue_net: toNumber(
      row["Sales Revenue Via foodpanda After Partner Funded Discounts (Q) =J+K+L+M-N-O-P"],
    ),
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
