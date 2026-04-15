import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

const dbPath = path.join(app.getPath("userData"), "pos.db");
export const databasePath = new Database(dbPath);

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
