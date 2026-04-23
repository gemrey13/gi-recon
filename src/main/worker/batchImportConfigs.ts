import * as XLSX from "xlsx";

export type BatchImportConfig = {
  rootFolder: string;
  sheetName: string;
  skipKey: string;
  xlsxOptions?: XLSX.ParsingOptions;
};

export type ImportSource = "PANDA" | "GRAB";

export const BATCH_IMPORT_CONFIGS: Record<ImportSource, BatchImportConfig> = {
  PANDA: {
    rootFolder: "C:\\panda-data",
    sheetName: "Appendix A",
    skipKey: "Order Code (F)",
    xlsxOptions: { cellDates: true },
  },
  GRAB: {
    rootFolder: "C:\\grab-data",
    sheetName: "Transactions",
    skipKey: "Booking ID",
  },
};
