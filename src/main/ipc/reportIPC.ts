import { ipcMain } from "electron";
import {
  getReconSummary,
  getDiscrepancyReport,
  getUnmatchedReport,
  getPartnerSalesReport,
  getBranchPerformanceReport,
  getSystemLogs,
  ReportFilters,
} from "../reports/reportQueries";

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

  ipcMain.handle("report:systemLogs", (_e, filters) =>
    getSystemLogs(filters)
  );
}