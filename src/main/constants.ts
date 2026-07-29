function toNumber(v: any): number {
  if (!v) return 0;
  const num = Number(String(v).replace(/,/g, "").trim());
  return isNaN(num) ? 0 : num;
}

function formatString(v: any) {
  if (v == null) return null;
  return String(v).trim();
}

function toSqliteDateTime(v: any, includeTime: boolean = false): string | null {
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

export const grabInsertStatement = `
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
`;

export const pandaInsertStatement = `
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
`;

function toPandaSqliteDateTime(v: any, includeTime: boolean = false): string | null {
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
