import { Database } from "better-sqlite3";
import { getTableColumns } from "./utils";
function sanitizeValue(val: any) {
  if (val === undefined || val === null) return null;

  // VALID Date only
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val.toISOString().slice(0, 19).replace("T", " ");
  }

  // Empty strings
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // Numeric strings (including commas)
    const num = Number(trimmed.replace(/,/g, ""));
    if (!isNaN(num)) return num;

    return trimmed;
  }

  // Objects / arrays → stringify (last resort)
  if (typeof val === "object") {
    return JSON.stringify(val);
  }

  // Numbers / booleans
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
        throw e;
      }
    }
  });

  tx();
}

export function insertGrabTransactions(db: Database, sessionId: number, rows: any[]) {
  const table = "grab_transactions";
  const tableCols = getTableColumns(db, table);

  const insertableCols = tableCols.filter(
    (c) => c !== "id" && c !== "recon_status" && c !== "linked_pos_id",
  );

  const columnsSql = insertableCols.join(", ");
  const valuesSql = insertableCols.map((c) => `@${c}`).join(", ");

  const stmt = db.prepare(`
    INSERT INTO ${table} (${columnsSql})
    VALUES (${valuesSql})
  `);

  const tx = db.transaction(() => {
    for (const row of rows) {
      const record: any = { session_id: sessionId };

      for (const col of insertableCols) {
        if (col === "session_id") continue;

        const raw = row[col];
        record[col] = sanitizeValue(raw);
      }

      try {
        stmt.run(record);
      } catch (e) {
        console.error("❌ INSERT FAILED");
        console.error("TABLE:", table);
        console.error("RECORD:", record);
        throw e;
      }
    }
  });

  tx();
}
