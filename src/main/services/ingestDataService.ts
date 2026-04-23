import * as XLSX from "xlsx";
import { grabInsertStatement, grabMapRow, pandaInsertStatement, pandaMapRow } from "../constants";
import { ImportManualOptions, SheetImportOptions } from "../types";
import { getDb } from "../utils";

function importFromSheet({
  filePath,
  sheetName,
  insertStatement,
  skipRow,
  mapRow,
  xlsxOptions,
  label,
}: SheetImportOptions): { inserted: number } {
  const db = getDb();

  const insertStmt = db.prepare(insertStatement);
  const workbook = XLSX.readFile(filePath, xlsxOptions);

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { raw: true });

  const transaction = db.transaction((rows: any[]) => {
    for (const row of rows) {
      if (skipRow(row)) continue;
      insertStmt.run(mapRow(row));
    }
  });

  transaction(rows);

  console.log(`[${label}] Total inserted: ${rows.length}`);

  return { inserted: rows.length };
}

const IMPORT_CONFIGS = {
  PANDA: {
    sheetName: "Appendix A",
    insertStatement: pandaInsertStatement,
    skipRow: (row: Record<string, any>) => !row["Order Code (F)"],
    mapRow: pandaMapRow,
    xlsxOptions: { cellDates: true },
    label: "Panda Manual Import",
  },
  GRAB: {
    sheetName: "Transactions",
    insertStatement: grabInsertStatement,
    skipRow: (row: Record<string, any>) => !row["Booking ID"],
    mapRow: grabMapRow,
    label: "Grab Manual Import",
  },
} as const;

export function importManual({ filePath, type }: ImportManualOptions) {
  return importFromSheet({ filePath, ...IMPORT_CONFIGS[type] });
}
