import { Database } from "better-sqlite3";
import { getTableColumns } from "./utils";

function sanitizeValue(val: any) {
  if (val === undefined || val === null) return null;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val.toISOString().slice(0, 19).replace("T", " ");
  }

  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;

    const num = Number(trimmed.replace(/,/g, ""));
    if (!isNaN(num)) return num;

    return trimmed;
  }

  if (typeof val === "object") {
    return JSON.stringify(val);
  }

  return val;
}

export function insertPOSTransactions(db: Database, sessionId: number, rows: any[]) {
  const table = "pos_transactions";
  const tableCols = getTableColumns(db, table);

  const insertableCols = tableCols.filter(
    (c) => c !== "id" && c !== "recon_status" && c !== "linked_grab_id",
  );

  const columnsSql = insertableCols.join(", ");
  const valuesSql = insertableCols.map((c) => `@${c}`).join(", ");

  const stmt = db.prepare(`
    INSERT INTO ${table} (${columnsSql})
    VALUES (${valuesSql})
  `);

  const errors: any[] = [];

  const tx = db.transaction(() => {
    for (const row of rows) {
      const record: any = { session_id: sessionId };

      for (const col of insertableCols) {
        if (col === "session_id") continue;

        const raw = row[col.toUpperCase()];
        record[col] = sanitizeValue(raw);
      }

      try {
        stmt.run(record);
      } catch (e) {
        console.error("❌ INSERT FAILED");
        console.error("TABLE:", table);
        console.error("RECORD:", record);
        errors.push({ record, error: e });
      }
    }
  });

  tx();

  return errors.length ? errors : null;
}

export function insertGrabTransactions(db: Database, sessionId: number, rows: any[]) {
  const stmt = db.prepare(`
    INSERT INTO grab_transactions (
      session_id,
      merchant_name, merchant_id, store_name, store_id,
      updated_on, created_on, type, category, subcategory,
      status, transaction_id, linked_transaction_id,
      partner_transaction_id_1, partner_transaction_id_2,
      long_order_id, short_order_id, booking_id,
      order_channel, order_type, payment_method,
      receiving_account_source_of_fund,
      terminal_id, channel, offer_type,
      grab_fee_percent, points_multiplier, points_issued,
      settlement_id, transfer_date,
      amount, tax_on_order_value, restaurant_packaging_charge,
      non_member_fee, restaurant_service_charge, offer,
      discount_merchant_funded, delivery_fee_discount_merchant_funded,
      delivery_charge_grab_online_store, delivery_charge_merchant_delivery,
      grab_express_delivery_service_fee,
      net_sales, net_mdr, tax_on_mdr, grab_fee,
      marketing_success_fee, delivery_commission, channel_commission,
      order_commission, grab_food_mart_other_commission,
      grab_kitchen_commission, grab_kitchen_other_commission, withholding_tax,
      total, tax_on_mdr_percent, delivery_commission_percent,
      channel_commission_percent, order_commission_percent,
      tax_on_grab_food_commission_adjustments_ads, tax_on_total,
      cancellation_reason, cancelled_by, reason_for_refund,
      description, incident_group, incident_alias,
      customer_refunded_item, appeal_link, appeal_status, package_voucher_used
    ) VALUES (
      @session_id,
      @merchant_name, @merchant_id, @store_name, @store_id,
      @updated_on, @created_on, @type, @category, @subcategory,
      @status, @transaction_id, @linked_transaction_id,
      @partner_transaction_id_1, @partner_transaction_id_2,
      @long_order_id, @short_order_id, @booking_id,
      @order_channel, @order_type, @payment_method,
      @receiving_account_source_of_fund,
      @terminal_id, @channel, @offer_type,
      @grab_fee_percent, @points_multiplier, @points_issued,
      @settlement_id, @transfer_date,
      @amount, @tax_on_order_value, @restaurant_packaging_charge,
      @non_member_fee, @restaurant_service_charge, @offer,
      @discount_merchant_funded, @delivery_fee_discount_merchant_funded,
      @delivery_charge_grab_online_store, @delivery_charge_merchant_delivery,
      @grab_express_delivery_service_fee,
      @net_sales, @net_mdr, @tax_on_mdr, @grab_fee,
      @marketing_success_fee, @delivery_commission, @channel_commission,
      @order_commission, @grab_food_mart_other_commission,
      @grab_kitchen_commission, @grab_kitchen_other_commission, @withholding_tax,
      @total, @tax_on_mdr_percent, @delivery_commission_percent,
      @channel_commission_percent, @order_commission_percent,
      @tax_on_grab_food_commission_adjustments_ads, @tax_on_total,
      @cancellation_reason, @cancelled_by, @reason_for_refund,
      @description, @incident_group, @incident_alias,
      @customer_refunded_item, @appeal_link, @appeal_status, @package_voucher_used
    )
  `);

  const errors: any[] = [];

  const tx = db.transaction(() => {
    for (const row of rows) {
      const record: any = {
        session_id: sessionId,

        // Map manually from CSV to DB
        merchant_name: row["merchant_name"] ?? null,
        merchant_id: row["merchant_id"] ?? null,
        store_name: row["store_name"] ?? null,
        store_id: row["store_id"] ?? null,
        updated_on: row["updated_on"] ?? null,
        created_on: row["created_on"] ?? null,
        type: row["type"] ?? null,
        category: row["category"] ?? null,
        subcategory: row["subcategory"] ?? null,
        status: row["status"] ?? null,
        transaction_id: row["transaction_id"] ?? null,
        linked_transaction_id: row["linked_transaction_id"] ?? null,
        partner_transaction_id_1: row["partner_transaction_id_1"] ?? null,
        partner_transaction_id_2: row["partner_transaction_id_2"] ?? null,
        long_order_id: row["long_order_id"] ?? null,
        short_order_id: row["short_order_id"] ?? null,
        booking_id: row["booking_id"] ?? null,
        order_channel: row["order_channel"] ?? null,
        order_type: row["order_type"] ?? null,
        payment_method: row["payment_method"] ?? null,
        receiving_account_source_of_fund: row["receiving_account_/_source_of_fund"] ?? null,
        terminal_id: row["terminal_id"] ?? null,
        channel: row["channel"] ?? null,
        offer_type: row["offer_type"] ?? null,
        grab_fee_percent: Number(row["grab_fee_(%)"] ?? 0),
        points_multiplier: Number(row["points_multiplier"] ?? 0),
        points_issued: Number(row["points_issued"] ?? 0),
        settlement_id: row["settlement_id"] ?? null,
        transfer_date: row["transfer_date"] ?? null,
        amount: Number(row["amount"] ?? 0),
        tax_on_order_value: Number(row["tax_on_order_value"] ?? 0),
        restaurant_packaging_charge: Number(row["restaurant_packaging_charge"] ?? 0),
        non_member_fee: Number(row["non-member_fee"] ?? 0),
        restaurant_service_charge: Number(row["restaurant_service_charge"] ?? 0),
        offer: Number(row["offer"] ?? 0),
        discount_merchant_funded: Number(row["discount_(merchant-funded)"] ?? 0),
        delivery_fee_discount_merchant_funded: Number(
          row["delivery_fee_discount_(merchant-funded)"] ?? 0,
        ),
        delivery_charge_grab_online_store: Number(row["delivery_charge_(grab_online_store)"] ?? 0),
        delivery_charge_merchant_delivery: Number(row["delivery_charge_(merchant_delivery)"] ?? 0),
        grab_express_delivery_service_fee: Number(row["grabexpress_delivery_service_fee"] ?? 0),
        net_sales: Number(row["net_sales"] ?? 0),
        net_mdr: Number(row["net_mdr"] ?? 0),
        tax_on_mdr: Number(row["tax_on_mdr"] ?? 0),
        grab_fee: Number(row["grab_fee"] ?? 0),
        marketing_success_fee: Number(row["marketing_success_fee"] ?? 0),
        delivery_commission: Number(row["delivery_commission"] ?? 0),
        channel_commission: Number(row["channel_commission"] ?? 0),
        order_commission: Number(row["order_commission"] ?? 0),
        grab_food_mart_other_commission: Number(row["grabfood_/_grabmart_other_commission"] ?? 0),
        grab_kitchen_commission: Number(row["grabkitchen_commission"] ?? 0),
        grab_kitchen_other_commission: Number(row["grabkitchen_other_commission"] ?? 0),
        withholding_tax: Number(row["withholding_tax"] ?? 0),
        total: Number(row["total"] ?? 0),
        tax_on_mdr_percent: Number(row["tax_on_mdr_(%)"] ?? 0),
        delivery_commission_percent: Number(row["delivery_commission_(%)"] ?? 0),
        channel_commission_percent: Number(row["channel_commission_(%)"] ?? 0),
        order_commission_percent: Number(row["order_commission_(%)"] ?? 0),
        tax_on_grab_food_commission_adjustments_ads: Number(
          row["tax_on_grabfood_/_grabmart_commission,_adjustments,_ads"] ?? 0,
        ),
        tax_on_total: Number(row["tax_on_total_grabkitchen_commission"] ?? 0),
        cancellation_reason: row["cancellation_reason"] ?? null,
        cancelled_by: row["cancelled_by"] ?? null,
        reason_for_refund: row["reason_for_refund"] ?? null,
        description: row["description"] ?? null,
        incident_group: row["incident_group"] ?? null,
        incident_alias: row["incident_alias"] ?? null,
        customer_refunded_item: row["customer_refunded_item"] ?? null,
        appeal_link: row["appeal_link"] ?? null,
        appeal_status: row["appeal_status"] ?? null,
        package_voucher_used: row["package/voucher_used"] ?? null,
      };

      try {
        stmt.run(record);
      } catch (e) {
        errors.push({ record, error: e });
      }
    }
  });

  tx();

  return errors.length ? errors : null;
}
