import Database from "better-sqlite3";
import * as XLSX from "xlsx";
import { grabInsertStatement, grabMapRow, pandaInsertStatement, pandaMapRow } from "../constants";

export function createDb(dbPath: string) {
  const db = new Database(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
  `);
  return db;
}

export type SheetImportOptions = {
  dbPath: string;
  filePath: string;
  sheetName: string;
  insertStatement: string;
  skipRow: (row: Record<string, any>) => boolean;
  mapRow: (row: Record<string, any>) => any;
  xlsxOptions?: XLSX.ParsingOptions;
  label: string;
};

function importFromSheet({
  dbPath,
  filePath,
  sheetName,
  insertStatement,
  skipRow,
  mapRow,
  xlsxOptions,
  label,
}: SheetImportOptions): { inserted: number } {
  const db = createDb(dbPath);

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

export type ImportManualOptions = {
  dbPath: string;
  filePath: string;
  type: "PANDA" | "GRAB";
};

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

export function importManual({ dbPath, filePath, type }: ImportManualOptions) {
  return importFromSheet({ dbPath, filePath, ...IMPORT_CONFIGS[type] });
}
