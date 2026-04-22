import { formatString, toNumber } from "../../utils";

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
