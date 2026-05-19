import { useState, useCallback, useRef } from "react";
import { useBranches } from "../hooks/useBranches";
import LoadingState from "@renderer/components/ui/LoadingState";
import { downloadCSV } from "@renderer/lib/helpers";
import { ReportFilters, ReportType } from "@shared/reports.types";
import { REPORT_CONFIG, TABLE_COMPONENTS } from "@renderer/lib/reportsConfig";

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + "01";

  const [activeReport, setActiveReport] = useState<ReportType>("reconSummary");
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: firstOfMonth,
    dateTo: today,
    branch: "",
    partnerType: "ALL",
  });
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const abortRef = useRef(false);

  const { branches, setSelectedProvider } = useBranches(filters.partnerType);
  const activeConfig = REPORT_CONFIG.find((r) => r.id === activeReport)!;
  const TableComponent = TABLE_COMPONENTS[activeReport];

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

  const handlePartnerTypeChange = (partnerType: "GRAB" | "PANDA" | "ALL") => {
    setFilters((f) => ({ ...f, partnerType, branch: "" }));
    setSelectedProvider(partnerType);
  };

  const summaryStats = { total: data.length };

  return (
    <div className="space-y-6 max-w-400 mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reports</h1>
            <p className="text-slate-500 font-medium mt-1">
              Generate and export reconciliation reports for reconciliation, sales, branch
              performance, and audit logs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hasRun && data.length > 0 && (
              <button
                onClick={() =>
                  downloadCSV(
                    `${activeReport}_${filters.dateFrom}_${filters.dateTo}_${filters.partnerType}.csv`,
                    data,
                  )
                }
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 active:scale-95 font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="btn-primary bg-indigo-600 hover:bg-indigo-500">
              {loading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Running…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-full max-w-xs shrink-0 overflow-y-auto">
          <div className="sticky top-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Report Type
            </p>
            <div className="mt-3 space-y-2">
              {REPORT_CONFIG.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleTabChange(r.id)}
                  className={`w-full flex items-start gap-3 rounded-2xl px-4 py-3 text-left  ${
                    activeReport === r.id
                      ? "bg-indigo-50 border border-indigo-100 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}>
                  <span
                    className={`mt-0.5 shrink-0 ${activeReport === r.id ? "text-indigo-600" : "text-slate-400"}`}>
                    {r.icon}
                  </span>
                  <div>
                    <div className="text-sm font-semibold leading-snug">{r.label}</div>
                    <div className="text-xs text-slate-400 leading-snug mt-1">{r.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="ml-4 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Choose the time range, branch, and other report criteria.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {activeConfig.label}
                </span>
              </div>
            </div>

            <div className="mt-6 mb-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Branch
                </label>
                <select
                  value={filters.branch}
                  onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100">
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
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm w-fit">
                    {(["ALL", "GRAB", "PANDA"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePartnerTypeChange(p)}
                        className={`px-3 py-2 font-medium transition-colors ${
                          filters.partnerType === p
                            ? "bg-indigo-600 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}>
                        {p === "ALL" ? "All" : p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Quick Select
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Today", fn: () => ({ dateFrom: today, dateTo: today }) },
                  {
                    label: "Yesterday",
                    fn: () => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      return { dateFrom: d.toISOString().slice(0, 10), dateTo: today };
                    },
                  },
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
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-100 transition-colors">
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex min-h-0 overflow-auto">
            <div className="w-full">
              {hasRun && !loading && (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
                  <span className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {summaryStats.total.toLocaleString()}
                    </span>{" "}
                    row{summaryStats.total !== 1 ? "s" : ""}
                  </span>
                  <span className="ml-4 text-xs text-slate-400">
                    {filters.dateFrom} → {filters.dateTo}
                    {filters.branch && branches
                      ? ` · ${branches.find((b: any) => b.pos_code === filters.branch)?.pos_name ?? filters.branch}`
                      : ""}
                    {activeConfig.hasPartnerFilter ? ` · ${filters.partnerType}` : ""}
                  </span>
                </div>
              )}

              <div className="mt-4 min-h-64">
                {loading ? (
                  <LoadingState />
                ) : !hasRun ? (
                  <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-slate-400 shadow-sm">
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
                      Set your filters and click <span className="text-indigo-600">Run Report</span>
                    </p>
                    <p className="text-xs mt-1 text-slate-400">{activeConfig.description}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <TableComponent data={data} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
