import { ipcMain } from "electron";
import { getReconSummary } from "../reports/getReconSummary";
import { getDiscrepancyReport } from "../reports/getDiscrepancyReport";
import { getUnmatchedReport } from "../reports/getUnmatchedReport";
import { getPartnerSalesReport } from "../reports/getPartnerSalesReport";
import { getBranchPerformanceReport } from "../reports/getBranchPerformanceReport";
import { getOverviewReport } from "../reports/getOverviewReport";
import { getSystemLogs } from "../reports/getSystemLogs";
import { ReportFilters } from "../types";

export function registerReportIPC() {
  ipcMain.handle("report:reconSummary", (_e, filters: ReportFilters) =>
    getReconSummary(filters)
  );

  ipcMain.handle("report:discrepancy", (_e, filters: ReportFilters) =>
    getDiscrepancyReport(filters)
  );

  ipcMain.handle("report:unmatched", (_e, filters: ReportFilters) =>
    getUnmatchedReport(filters)
  );

  ipcMain.handle("report:partnerSales", (_e, filters: ReportFilters) =>
    getPartnerSalesReport(filters)
  );

  ipcMain.handle("report:branchPerformance", (_e, filters: ReportFilters) =>
    getBranchPerformanceReport(filters)
  );

  ipcMain.handle("report:overview", (_e, filters: ReportFilters) =>
    getOverviewReport(filters)
  );

  ipcMain.handle("report:systemLogs", (_e, filters) =>
    getSystemLogs(filters)
  );
}