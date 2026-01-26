import DatabaseConstructor, { Database } from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

// Get the path to AppData/Roaming/gi-recon/database.db
const dbPath = path.join(app.getPath('userData'), 'gi-recon.db');

// Ensure the directory exists (important for the first run)
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize the database
const db: Database = new DatabaseConstructor(dbPath);

export { db };

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pos_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cslipno TEXT UNIQUE,        -- The Transaction/Slip Number
      cusno TEXT,                 -- Customer ID
      gross_amount REAL,          -- GRSCHRG
      order_date TEXT,            -- ORDDATE
      order_time TEXT,            -- ORDTIME
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS partner_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      partner_name TEXT, -- 'Grab' or 'Foodpanda'
      order_id TEXT,
      amount_received REAL,
      statement_date TEXT
    );
  `);
  console.log('Gi-Recon Database initialized at:', dbPath);
}

export default db;