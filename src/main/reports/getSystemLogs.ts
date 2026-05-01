import { SystemLogRow } from "../types";
import { getDb } from "../utils";

export function getSystemLogs(
  filters: {
    dateFrom?: string;
    dateTo?: string;
    level?: string;
    module?: string;
    limit?: number;
  } = {},
): SystemLogRow[] {
  const db = getDb();

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.dateFrom) {
    conditions.push("timestamp >= ?");
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push("timestamp <= ?");
    params.push(filters.dateTo + " 23:59:59");
  }
  if (filters.level) {
    conditions.push("level = ?");
    params.push(filters.level);
  }
  if (filters.module) {
    conditions.push("module = ?");
    params.push(filters.module);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = filters.limit ?? 500;

  return db
    .prepare(
      `
    SELECT * FROM system_logs ${where}
    ORDER BY timestamp DESC
    LIMIT ${limit}
  `,
    )
    .all(...params) as SystemLogRow[];
}
