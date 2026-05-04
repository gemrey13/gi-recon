import { JSX } from "react";
import { ReportType } from "@shared/reports.types";
import ReconSummaryTable from "@renderer/components/table/ReconSummaryTable";
import DiscrepancyTable from "@renderer/components/table/DiscrepancyTable";
import UnmatchedTable from "@renderer/components/table/UnmatchedTable";
import PartnerSalesTable from "@renderer/components/table/PartnerSalesTable";
import BranchPerformanceTable from "@renderer/components/table/BranchPerformanceTable";
import SystemLogsTable from "@renderer/components/table/SystemLogsTable";

export const TABLE_COMPONENTS: Record<
  ReportType,
  React.ComponentType<{ data: Record<string, unknown>[] }>
> = {
  reconSummary: ReconSummaryTable,
  discrepancy: DiscrepancyTable,
  unmatched: UnmatchedTable,
  partnerSales: PartnerSalesTable,
  branchPerformance: BranchPerformanceTable,
  systemLogs: SystemLogsTable,
};

export const REPORT_CONFIG: Array<{
  id: ReportType;
  label: string;
  description: string;
  icon: JSX.Element;
  ipcChannel: string;
  hasPartnerFilter: boolean;
}> = [
  {
    id: "reconSummary",
    label: "Reconciliation Summary",
    description: "Match rates, counts, and variance by branch",
    ipcChannel: "reconSummary",
    hasPartnerFilter: true,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M9 12l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3h18M3 21h18"
        />
      </svg>
    ),
  },
  {
    id: "discrepancy",
    label: "Discrepancy Report",
    description: "Matched records with non-zero amount differences",
    ipcChannel: "discrepancy",
    hasPartnerFilter: true,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
    ),
  },
  {
    id: "unmatched",
    label: "Unmatched Transactions",
    description: "POS transactions with no partner match",
    ipcChannel: "unmatched",
    hasPartnerFilter: true,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
        />
      </svg>
    ),
  },
  {
    id: "partnerSales",
    label: "Partner Sales Report",
    description: "Gross sales, commissions, and net revenue by partner",
    ipcChannel: "partnerSales",
    hasPartnerFilter: true,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: "branchPerformance",
    label: "Branch Performance",
    description: "POS vs partner revenue comparison per branch",
    ipcChannel: "branchPerformance",
    hasPartnerFilter: false,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
        />
      </svg>
    ),
  },
  {
    id: "systemLogs",
    label: "System Logs",
    description: "Audit trail of all system actions and events",
    ipcChannel: "systemLogs",
    hasPartnerFilter: false,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
];
