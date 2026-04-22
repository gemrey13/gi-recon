import Database from "better-sqlite3";
import * as XLSX from "xlsx";
import { formatString, toNumber, toSqliteDateTime } from "../utils";

export type ImportGrabManualOptions = {
  dbPath: string;
  filePath: string;
};

function mapRow(row: any) {
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

export function importGrabManual({ dbPath, filePath }: ImportGrabManualOptions) {
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
      merchant_name = excluded.merchant_name,
      merchant_id = excluded.merchant_id,
      store_name = excluded.store_name,
      store_id = excluded.store_id,
      updated_on = excluded.updated_on,
      created_on = excluded.created_on,
      type = excluded.type,
      category = excluded.category,
      receiving_account = excluded.receiving_account,
      subcategory = excluded.subcategory,
      status = excluded.status,
      transaction_id = excluded.transaction_id,
      linked_transaction_id = excluded.linked_transaction_id,
      partner_transaction_id_1 = excluded.partner_transaction_id_1,
      partner_transaction_id_2 = excluded.partner_transaction_id_2,
      long_order_id = excluded.long_order_id,
      short_order_id = excluded.short_order_id,
      order_channel = excluded.order_channel,
      order_type = excluded.order_type,
      payment_method = excluded.payment_method,
      terminal_id = excluded.terminal_id,
      channel = excluded.channel,
      offer_type = excluded.offer_type,
      grab_fee_percent = excluded.grab_fee_percent,
      points_multiplier = excluded.points_multiplier,
      points_issued = excluded.points_issued,
      settlement_id = excluded.settlement_id,
      transfer_date = excluded.transfer_date,
      amount = excluded.amount,
      tax_on_order_value = excluded.tax_on_order_value,
      packaging_charge = excluded.packaging_charge,
      non_member_fee = excluded.non_member_fee,
      service_charge = excluded.service_charge,
      offer = excluded.offer,
      discount_merchant = excluded.discount_merchant,
      delivery_fee_discount = excluded.delivery_fee_discount,
      delivery_charge_gos = excluded.delivery_charge_gos,
      delivery_charge_merchant = excluded.delivery_charge_merchant,
      grabexpress_fee = excluded.grabexpress_fee,
      net_sales = excluded.net_sales,
      net_mdr = excluded.net_mdr,
      tax_on_mdr = excluded.tax_on_mdr,
      grab_fee = excluded.grab_fee,
      marketing_success_fee = excluded.marketing_success_fee,
      delivery_commission = excluded.delivery_commission,
      channel_commission = excluded.channel_commission,
      order_commission = excluded.order_commission,
      grabfood_other_commission = excluded.grabfood_other_commission,
      grabkitchen_commission = excluded.grabkitchen_commission,
      grabkitchen_other_commission = excluded.grabkitchen_other_commission,
      withholding_tax = excluded.withholding_tax,
      total = excluded.total,
      cancellation_reason = excluded.cancellation_reason,
      cancelled_by = excluded.cancelled_by,
      reason_for_refund = excluded.reason_for_refund,
      description = excluded.description,
      incident_group = excluded.incident_group,
      incident_alias = excluded.incident_alias,
      customer_refund_item = excluded.customer_refund_item,
      appeal_link = excluded.appeal_link,
      appeal_status = excluded.appeal_status
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
