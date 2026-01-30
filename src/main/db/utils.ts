import { Database } from "better-sqlite3";

export function getTableColumns(db: Database, table: string): string[] {
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .map((c: any) => c.name);
}
