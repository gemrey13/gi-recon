import { useState, useCallback, useRef, JSX } from "react";
import { useBranches } from "../hooks/useBranches";
import LoadingState from "@renderer/components/ui/LoadingState";
import Badge from "@renderer/components/ui/Badge";
import EmptyState from "@renderer/components/ui/EmptyState";
import { downloadCSV, fmt, PCT, PHP } from "@renderer/lib/helpers";
import ReconSummaryTable from "@renderer/components/table/ReconSummaryTable";
import DiscrepancyTable from "@renderer/components/table/DiscrepancyTable";
import UnmatchedTable from "@renderer/components/table/UnmatchedTable";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  branch: string;
  partnerType: "GRAB" | "PANDA";
}

type ReportType =
  | "reconSummary"
  | "discrepancy"
  | "unmatched"
  | "partnerSales"
  | "branchPerformance"
  | "systemLogs";


// ─── Report: Recon Summary ────────────────────────────────────────────────────


// ─── Report: Discrepancy ──────────────────────────────────────────────────────


// ─── Report: Unmatched ────────────────────────────────────────────────────────



// ─── Report: Partner Sales ────────────────────────────────────────────────────

function PartnerSalesTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return <EmptyState message="No partner sales data found." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Branch</th>
            <th className="px-4 py-3">Partner</th>
            <th className="px-4 py-3 text-right">Orders</th>
            <th className="px-4 py-3 text-right">Gross Sales</th>
            <th className="px-4 py-3 text-right">Commission</th>
            <th className="px-4 py-3 text-right">WHT</th>
            <th className="px-4 py-3 text-right">Total Fees</th>
            <th className="px-4 py-3 text-right">Net Sales</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-800">{String(row.branch_name)}</td>
              <td className="px-4 py-3">
                <Badge
                  value={String(row.partner_type)}
                  type={String(row.partner_type) === "GRAB" ? "grab" : "panda"}
                />
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {fmt(row.total_orders as number)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {PHP(row.gross_sales as number)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-red-400">
                {PHP(row.commission_amt as number)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-red-400">
                {PHP(row.withholding_tax as number)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-red-400">
                {PHP(row.total_fees as number)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold text-emerald-600">
                {PHP(row.net_sales as number)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Report: Branch Performance ───────────────────────────────────────────────

function BranchPerformanceTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return <EmptyState message="No branch performance data found." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Branch</th>
            <th className="px-4 py-3 text-right">POS Total</th>
            <th className="px-4 py-3 text-right">Grab Total</th>
            <th className="px-4 py-3 text-right">Panda Total</th>
            <th className="px-4 py-3 text-right">Partner Total</th>
            <th className="px-4 py-3 text-right">Variance</th>
            <th className="px-4 py-3 text-right">Match Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => {
            const variance = Number(row.total_variance ?? 0);
            const rate = Number(row.match_rate ?? 0);
            return (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{String(row.branch_name)}</div>
                  <div className="text-xs text-slate-400">{String(row.branch)}</div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {PHP(row.pos_total as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-green-600">
                  {PHP(row.grab_total as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-pink-600">
                  {PHP(row.panda_total as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  {PHP(row.partner_total as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span
                    className={
                      Math.abs(variance) > 0 ? "text-red-500 font-semibold" : "text-slate-400"
                    }>
                    {variance > 0 ? "+" : ""}
                    {PHP(variance)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-medium ${rate >= 90 ? "text-emerald-600" : rate >= 70 ? "text-amber-600" : "text-red-500"}`}>
                    {PCT(rate)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Report: System Logs ──────────────────────────────────────────────────────

function SystemLogsTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return <EmptyState message="No system logs found." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Level</th>
            <th className="px-4 py-3">Module</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">User</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-mono text-xs">
          {data.map((row, i) => {
            const level = String(row.level);
            return (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                  {String(row.timestamp)}
                </td>
                <td className="px-4 py-2.5">
                  <Badge
                    value={level}
                    type={
                      level === "ERROR"
                        ? "danger"
                        : level === "WARN"
                          ? "warn"
                          : level === "INFO"
                            ? "success"
                            : "neutral"
                    }
                  />
                </td>
                <td className="px-4 py-2.5 text-indigo-600">{String(row.module)}</td>
                <td className="px-4 py-2.5 text-slate-600">{String(row.action)}</td>
                <td
                  className="px-4 py-2.5 text-slate-700 max-w-xs truncate"
                  title={String(row.message)}>
                  {String(row.message)}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{String(row.user_name)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

const REPORT_CONFIG: Array<{
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
    hasPartnerFilter: false,
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

const TABLE_COMPONENTS: Record<
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + "01";

  const [activeReport, setActiveReport] = useState<ReportType>("reconSummary");
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: firstOfMonth,
    dateTo: today,
    branch: "",
    partnerType: "GRAB",
  });
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const abortRef = useRef(false);

  const { branches, setSelectedProvider } = useBranches(filters.partnerType);

  const activeConfig = REPORT_CONFIG.find((r) => r.id === activeReport)!;

  const runReport = useCallback(async () => {
    setLoading(true);
    setHasRun(true);
    abortRef.current = false;

    try {
      const payload =
        activeReport === "systemLogs"
          ? { dateFrom: filters.dateFrom, dateTo: filters.dateTo, limit: 500 }
          : {
              dateFrom: filters.dateFrom || undefined,
              dateTo: filters.dateTo || undefined,
              branch: filters.branch || undefined,
              partnerType: filters.partnerType,
            };

      const result = await (window as any).api[activeReport](payload);
      console.log(`[Reports] Fetched data for ${activeReport}:`, result);
      if (!abortRef.current) setData(result ?? []);
    } catch (err) {
      console.error("[Reports] Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeReport, filters]);

  const handleTabChange = (id: ReportType) => {
    setActiveReport(id);
    setData([]);
    setHasRun(false);
  };

  const handlePartnerTypeChange = (partnerType: "GRAB" | "PANDA") => {
    setFilters((f) => ({ ...f, partnerType, branch: "" }));
    setSelectedProvider(partnerType);
  };

  const TableComponent = TABLE_COMPONENTS[activeReport];

  const summaryStats = {
    total: data.length,
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* ── Header ── */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Reports</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate and export reconciliation reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasRun && data.length > 0 && (
              <button
                onClick={() =>
                  downloadCSV(`${activeReport}_${filters.dateFrom}_${filters.dateTo}.csv`, data)
                }
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export CSV
              </button>
            )}
            <button
              onClick={runReport}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {loading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Running…
                </>
              ) : (
                <>
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Run Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar: report types ── */}
        <div className="w-56 shrink-0 border-r border-slate-200 bg-white py-3 overflow-y-auto">
          <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Report Type
          </p>
          {REPORT_CONFIG.map((r) => (
            <button
              key={r.id}
              onClick={() => handleTabChange(r.id)}
              className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                activeReport === r.id
                  ? "bg-indigo-50 border-r-2 border-indigo-600 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}>
              <span
                className={`mt-0.5 shrink-0 ${activeReport === r.id ? "text-indigo-600" : "text-slate-400"}`}>
                {r.icon}
              </span>
              <div>
                <div className="text-xs font-medium leading-snug">{r.label}</div>
                <div className="text-[10px] text-slate-400 leading-snug mt-0.5">
                  {r.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* ── Filters ── */}
          <div className="border-b border-slate-200 bg-white px-6 py-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                  className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                  className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Branch
                </label>
                <select
                  value={filters.branch}
                  onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
                  className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300">
                  <option value="">Select a branch...</option>
                  {branches?.map((b: any) => (
                    <option key={b.pos_code} value={b.pos_code}>
                      {b.partner_name}
                    </option>
                  ))}
                </select>
              </div>

              {activeConfig.hasPartnerFilter && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Partner
                  </label>
                  <div className="flex rounded-md border border-slate-200 overflow-hidden text-xs">
                    {(["GRAB", "PANDA"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePartnerTypeChange(p)}
                        className={`px-3 py-1.5 font-medium transition-colors ${
                          filters.partnerType === p
                            ? "bg-indigo-600 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick date presets */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Quick Select
                </label>
                <div className="flex gap-1">
                  {[
                    { label: "Today", fn: () => ({ dateFrom: today, dateTo: today }) },
                    { label: "This Month", fn: () => ({ dateFrom: firstOfMonth, dateTo: today }) },
                    {
                      label: "Last 7d",
                      fn: () => {
                        const d = new Date();
                        d.setDate(d.getDate() - 6);
                        return { dateFrom: d.toISOString().slice(0, 10), dateTo: today };
                      },
                    },
                    {
                      label: "Last 30d",
                      fn: () => {
                        const d = new Date();
                        d.setDate(d.getDate() - 29);
                        return { dateFrom: d.toISOString().slice(0, 10), dateTo: today };
                      },
                    },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setFilters((f) => ({ ...f, ...preset.fn() }))}
                      className="rounded border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Result area ── */}
          <div className="flex-1 overflow-auto">
            {/* Stats bar */}
            {hasRun && !loading && (
              <div className="border-b border-slate-100 bg-white px-6 py-2 flex items-center gap-6">
                <span className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {summaryStats.total.toLocaleString()}
                  </span>{" "}
                  row{summaryStats.total !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-slate-400">
                  {filters.dateFrom} → {filters.dateTo}
                  {filters.branch && branches
                    ? ` · ${branches.find((b: any) => b.pos_code === filters.branch)?.pos_name ?? filters.branch}`
                    : ""}
                  {activeConfig.hasPartnerFilter ? ` · ${filters.partnerType}` : ""}
                </span>
              </div>
            )}

            {loading ? (
              <LoadingState />
            ) : !hasRun ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <svg
                  className="mb-4 h-12 w-12 opacity-30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M3 21h18M12 3a4 4 0 100 8 4 4 0 000-8z"
                  />
                </svg>
                <p className="text-sm font-medium">
                  Set your filters and click <span className="text-indigo-500">Run Report</span>
                </p>
                <p className="text-xs mt-1 text-slate-300">{activeConfig.description}</p>
              </div>
            ) : (
              <TableComponent data={data} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
