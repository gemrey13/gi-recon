export type PartnerType = "PANDA" | "GRAB";
import * as XLSX from "xlsx";

export interface BranchMapping {
  pos_code: string;
  pos_name: string;
  partner_name?: string;
  grab_name?: string | null;
  foodpanda_name?: string | null;
}

export type ImportManualOptions = {
  filePath: string;
  type: PartnerType;
};

export type SheetImportOptions = {
  filePath: string;
  sheetName: string;
  insertStatement: string;
  skipRow: (row: Record<string, any>) => boolean;
  mapRow: (row: Record<string, any>) => any;
  xlsxOptions?: XLSX.ParsingOptions;
  label: string;
};

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export type LogModule =
  | "UI"
  | "MAIN"
  | "DATABASE"
  | "GRAB_SERVICE"
  | "AUTH"
  | "PANDA_SERVICE"
  | "EXPORT_SERVICE"
  | "IMPORT_SERVICE"
  | "OTHER";

export type LogAction =
  | "APP_START"
  | "APP_QUIT"
  | "PAGE_VIEW"
  | "CLICK"
  | "DB_QUERY"
  | "RECON_RUN"
  | "RECON_SAVE"
  | "API_ERROR";

export interface SystemLog {
  id?: number;
  timestamp?: string;
  level: LogLevel;
  module: LogModule;
  action: string;
  message: string;
  description?: string;
  user_name?: string;
}

export interface ReconRange {
  startDate: string;
  endDate: string;
  branch: string;
}

export interface ReconResults {
  matched: any[];
  unmatchedPos: any[];
  unmatchedPartner: any[];
}

export type BatchImportConfig = {
  rootFolder: string;
  sheetName: string;
  skipKey: string;
  xlsxOptions?: XLSX.ParsingOptions;
};
