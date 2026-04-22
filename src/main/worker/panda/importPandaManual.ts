import Database from "better-sqlite3";
import * as XLSX from "xlsx";
import { pandaInsertStatement, pandaMapRow } from "./pandaConstants";

export type ImportPandaManualOptions = {
  dbPath: string;
  filePath: string;
};

export function importPandaManual({ dbPath, filePath }: ImportPandaManualOptions) {
  const db = new Database(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
  `);

  const insertStmt = db.prepare(pandaInsertStatement);
  const workbook = XLSX.readFile(filePath, { cellDates: true });

  const sheet = workbook.Sheets["Appendix A"];
  if (!sheet) throw new Error("Appendix A sheet not found");

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { raw: true });

  const transaction = db.transaction((rows: any[]) => {
    for (const row of rows) {
      if (!row["Order Code (F)"]) continue;
      insertStmt.run(pandaMapRow(row));
    }
  });

  transaction(rows);

  const totalInserted = rows.length;

  console.log(`[Panda Manual Import] Total inserted: ${totalInserted}`);

  return {
    inserted: totalInserted,
  };
}
