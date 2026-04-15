import { parentPort, workerData } from "worker_threads";
import path from "path";
import * as XLSX from "xlsx";
import { formatString, toNumber, toSqliteDateTime } from "../utils";

const { files, rootFolder, batchSize } = workerData as {
  files: string[];
  rootFolder: string;
  batchSize: number;
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
    transfer_date: toSqliteDateTime(row["Transfer Date"], true), // optional: same format

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

async function run() {
  console.log(`[Grab Reader] Started with ${files.length} files`);

  for (const file of files) {
    const fullPath = path.join(rootFolder, file);
    const workbook = XLSX.readFile(fullPath);

    const sheet = workbook.Sheets["Transactions"];
    if (!sheet) continue;

    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

    let batch: any[] = [];

    for (const row of rows) {
      if (!row["Booking ID"]) continue;

      batch.push(mapRow(row));

      if (batch.length >= batchSize) {
        parentPort?.postMessage({ batch, source: "grab" });
        batch = [];
      }
    }

    if (batch.length) {
      parentPort?.postMessage({ batch, source: "grab" });
    }

    console.log(`[Grab Reader] Finished file ${file}`);
  }

  parentPort?.postMessage({ done: true });
}

run();
