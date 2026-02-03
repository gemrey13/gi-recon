import DatabaseConstructor, { Database } from "better-sqlite3";
import { app } from "electron";
import path from "path";
import fs from "fs";

const dbPath = path.join(app.getPath("userData"), "gi-recon.db");

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db: Database = new DatabaseConstructor(dbPath);

export { db };

export function initDb() {
  // 1. Audit Sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      partner TEXT NOT NULL,
      branch_name TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      total_partner_amt REAL DEFAULT 0,
      total_pos_amt REAL DEFAULT 0,
      total_net_payout REAL DEFAULT 0,
      issue_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. POS Transactions (Expanded with all DBF columns)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pos_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,

      -- Primary Identifiers
      cslipno TEXT, -- The main slip/receipt number
      orddate TEXT,
      ordtime TEXT,

      -- Customer Details
      cusno TEXT,
      cusname TEXT,
      cusaddr1 TEXT,
      cusaddr2 TEXT,
      custel TEXT,
      cusfax TEXT,
      cuscont TEXT,
      age TEXT,

      -- Financial Breakdown
      chargpct REAL DEFAULT 0,
      grschrg REAL DEFAULT 0,     -- Gross Charge
      promo_pct REAL DEFAULT 0,
      promo_amt REAL DEFAULT 0,
      sr_tcust INTEGER DEFAULT 0,
      sr_body TEXT,
      sr_disc REAL DEFAULT 0,
      vat REAL DEFAULT 0,
      servchrg REAL DEFAULT 0,
      othdisc REAL DEFAULT 0,
      udisc REAL DEFAULT 0,
      bankcharg REAL DEFAULT 0,
      totchrg REAL DEFAULT 0,     -- Total Charge
      pdamt REAL DEFAULT 0,       -- Paid Amount
      pmtdisc REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      tcash REAL DEFAULT 0,
      tcharge REAL DEFAULT 0,
      tsigned REAL DEFAULT 0,
      vat_xmpt REAL DEFAULT 0,
      ntax_sal REAL DEFAULT 0,

      -- Specific Discount Tracking
      dis_prom REAL DEFAULT 0,
      dis_udisc REAL DEFAULT 0,
      dis_sr REAL DEFAULT 0,
      dis_emp REAL DEFAULT 0,
      dis_vip REAL DEFAULT 0,
      dis_gpc REAL DEFAULT 0,
      dis_pwd REAL DEFAULT 0,
      dis_g REAL DEFAULT 0,
      dis_h REAL DEFAULT 0,
      dis_i REAL DEFAULT 0,
      dis_j REAL DEFAULT 0,
      dis_k REAL DEFAULT 0,
      dis_l REAL DEFAULT 0,
      dis_vx REAL DEFAULT 0,

      -- Payment & Misc
      terms TEXT,
      cardno TEXT,
      cardtyp TEXT,
      lastpd TEXT,
      remarks TEXT,
      filler1 TEXT,
      filler2 TEXT,

      -- Matching State
      recon_status TEXT DEFAULT 'unreconciled',
      linked_grab_id INTEGER DEFAULT NULL,

      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
    );
  `);

  // 4. Grab Transactions (Comprehensive Column Support)
  db.exec(`
    CREATE TABLE IF NOT EXISTS grab_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,

      -- Identity & Reference
      merchant_name TEXT,
      merchant_id TEXT,
      store_name TEXT,
      store_id TEXT,
      updated_on TEXT,
      created_on TEXT,
      type TEXT,
      category TEXT,
      subcategory TEXT,
      status TEXT,
      transaction_id TEXT UNIQUE,
      linked_transaction_id TEXT,
      partner_transaction_id_1 TEXT,
      partner_transaction_id_2 TEXT,
      long_order_id TEXT,
      short_order_id TEXT,
      booking_id TEXT,

      -- Channel & Payment
      order_channel TEXT,
      order_type TEXT,
      payment_method TEXT,
      receiving_account_source_of_fund TEXT,
      terminal_id TEXT,
      channel TEXT,
      offer_type TEXT,

      -- Commissions & Points
      grab_fee_percent REAL,
      points_multiplier REAL,
      points_issued REAL,
      settlement_id TEXT,
      transfer_date TEXT,

      -- Financial Breakdown
      amount REAL,
      tax_on_order_value REAL,
      restaurant_packaging_charge REAL,
      non_member_fee REAL,
      restaurant_service_charge REAL,
      offer REAL,
      discount_merchant_funded REAL,
      delivery_fee_discount_merchant_funded REAL,
      delivery_charge_grab_online_store REAL,
      delivery_charge_merchant_delivery REAL,
      grab_express_delivery_service_fee REAL,
      net_sales REAL,
      net_mdr REAL,
      tax_on_mdr REAL,
      grab_fee REAL,
      marketing_success_fee REAL,
      delivery_commission REAL,
      channel_commission REAL,
      order_commission REAL,
      grab_food_mart_other_commission REAL,
      grab_kitchen_commission REAL,
      grab_kitchen_other_commission REAL,
      withholding_tax REAL,
      total REAL,
      tax_on_mdr_percent REAL,
      delivery_commission_percent REAL,
      channel_commission_percent REAL,
      order_commission_percent REAL,
      tax_on_grab_food_commission_adjustments_ads REAL,
      tax_on_total REAL,

      -- Cancellation & Incidents
      cancellation_reason TEXT,
      cancelled_by TEXT,
      reason_for_refund TEXT,
      description TEXT,
      incident_group TEXT,
      incident_alias TEXT,
      customer_refunded_item TEXT,
      appeal_link TEXT,
      appeal_status TEXT,
      package_voucher_used TEXT,

      -- Reconciliation Fields (Internal)
      pos_amount REAL DEFAULT 0,
      variance REAL DEFAULT 0,
      recon_status TEXT DEFAULT 'unreconciled',
      internal_notes TEXT DEFAULT NULL,
      linked_pos_id INTEGER DEFAULT NULL,

      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
    );
  `);

  db.function("sanitize", (str: string) => {
    if (!str) return "";
    return str.toUpperCase().replace(/[0O]/g, "0").replace(/[1I]/g, "1").trim();
  });
}

export default db;
