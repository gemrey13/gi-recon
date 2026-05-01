export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  branch: string;
  partnerType: "GRAB" | "PANDA";
}

export type ReportType =
  | "reconSummary"
  | "discrepancy"
  | "unmatched"
  | "partnerSales"
  | "branchPerformance"
  | "systemLogs";
