import DatabaseConstructor, { Database } from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(app.getPath('userData'), 'gi-recon.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db: Database = new DatabaseConstructor(dbPath);

export { db };

export function initDb() {
  // 1. Processed files table
  db.exec(`
    CREATE TABLE IF NOT EXISTS processed_files (
      file_hash TEXT PRIMARY KEY,
      file_type TEXT,
      file_name TEXT,
      imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. POS Table with the missing UNIQUE constraint
  db.exec(`
    CREATE TABLE IF NOT EXISTS pos_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cslipno TEXT,
      cusno TEXT,
      cusname TEXT,
      gross_amount REAL,
      order_date TEXT,
      order_time TEXT,
      UNIQUE(cslipno, order_date, gross_amount) -- THIS IS THE KEY PART
    );
  `);
  console.log('Gi-Recon Database initialized at:', dbPath);

}

export default db;