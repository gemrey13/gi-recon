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
  db.exec(`
    CREATE TABLE IF NOT EXISTS processed_files (
      file_hash TEXT PRIMARY KEY,
      file_type TEXT,
      file_name TEXT,
      imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS pos_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cslipno TEXT,
      cusno TEXT,
      cusname TEXT,
      gross_amount REAL,
      order_date TEXT,
      order_time TEXT,
      status TEXT DEFAULT NULL,       -- Only populated during Recon
      UNIQUE(cslipno, order_date, gross_amount) -- THIS IS THE KEY PART
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS foodpanda_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT UNIQUE,
      gross_amount REAL,
      order_date TEXT,
      partner_name TEXT,
      recon_status TEXT DEFAULT 'unreconciled', /* Values: 'unreconciled', 'MATCHED', 'PENDING', 'FLAGGED', 'RESOLVED' */
      partner_reply TEXT DEFAULT NULL,  -- ADD THIS HERE
      internal_notes TEXT DEFAULT NULL  -- Useful for your team's comments
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS grab_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id TEXT UNIQUE,
      amount REAL,
      updated_on TEXT,
      store_name TEXT,
      category TEXT,
      recon_status TEXT DEFAULT 'unreconciled', /* Values: 'unreconciled', 'MATCHED', 'PENDING', 'FLAGGED', 'RESOLVED' */
      partner_reply TEXT DEFAULT NULL,  -- ADD THIS HERE
      internal_notes TEXT DEFAULT NULL  -- Useful for your team's comments
    );
  `);

  db.function("sanitize", (str: string) => {
    if (!str) return "";
    return str.toUpperCase().replace(/[0O]/g, "0").replace(/[1I]/g, "1").trim();
  });
  console.log("Gi-Recon Database initialized at:", dbPath);
}

export default db;
