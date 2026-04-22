import Database from "better-sqlite3";
import * as XLSX from "xlsx";
import { grabInsertStatement, grabMapRow } from "./grabConstans";

export type ImportGrabManualOptions = {
  dbPath: string;
  filePath: string;
};

export function importGrabManual({ dbPath, filePath }: ImportGrabManualOptions) {
  const db = new Database(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
  `);

  const insertStmt = db.prepare(grabInsertStatement);
  const workbook = XLSX.readFile(filePath);

  const sheet = workbook.Sheets["Transactions"];
  if (!sheet) throw new Error("Transactions sheet not found");

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  const transaction = db.transaction((rows: any[]) => {
    for (const row of rows) {
      if (!row["Booking ID"]) continue;
      insertStmt.run(grabMapRow(row));
    }
  });

  transaction(rows);

  const totalInserted = rows.length;

  console.log(`[Grab Manual Import] Total inserted: ${totalInserted}`);

  return {
    inserted: totalInserted,
  };
}
