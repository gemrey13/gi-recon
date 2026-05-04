import * as XLSX from "xlsx";

// ─────────────────────────────────────────────
// Recon Types
// ─────────────────────────────────────────────

export interface SystemLogRow {
  id: number;
  timestamp: string;
  level: string;
  module: string;
  action: string;
  message: string;
  description: string;
  user_name: string;
}

export interface ReconSummaryRow {
  branch: string;
  branch_name: string;
  total_pos: number;
  matched: number;
  unmatched: number;
  exact_matches: number;
  tolerance_matches: number;
  manual_matches: number;
  match_rate: number;
  total_pos_amount: number;
  total_partner_amount: number;
  total_variance: number;
}

export interface DiscrepancyRow {
  branch: string;
  branch_name: string;
  partner_type: string;
  pos_cslipno: string;
  pos_amount: number;
  partner_amount: number;
  amount_difference: number;
  match_level: string;
  orddate: string;
}

export interface UnmatchedRow {
  id: number;
  branch: string;
  branch_name: string;
  partner_type: string;
  cslipno: string;
  orddate: string;
  totchrg: number;
}

export interface PartnerSalesRow {
  branch_name: string;
  partner_type: string;
  total_orders: number;
  gross_sales: number;
  commission_amt: number;
  withholding_tax: number;
  net_sales: number;
  total_fees: number;
}

export interface BranchPerformanceRow {
  branch: string;
  branch_name: string;
  pos_total: number;
  grab_total: number;
  panda_total: number;
  partner_total: number;
  total_variance: number;
  match_rate: number;
}

export interface ReportFilters {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  branch?: string; // pos_code
  partnerType?: "GRAB" | "PANDA" | "ALL";
}

export type PartnerType = "PANDA" | "GRAB";

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
