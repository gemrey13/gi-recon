import { FilterState, ReconcileResponse } from "@renderer/types/results";
import ImportGrabModal from "@renderer/ui/modal/ImportGrabModal";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";

const GrabDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showAddGrab, setShowAddGrab] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [results, setResults] = useState<ReconcileResponse>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Load branch options
  useEffect(() => {
    window.api.getGrabBranches().then(setBranches);
  }, []);

  // 🔹 Load filters from URL on mount
  useEffect(() => {
    const params = queryString.parse(location.search);
    setFilters({
      branch: (params.branch as string) || undefined,
      fromDate: (params.fromDate as string) || undefined,
      toDate: (params.toDate as string) || undefined,
    });
  }, [location.search]);

  // 🔹 Update URL when filters change
  const updateFilter = (key: keyof FilterState, value?: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);

    navigate({
      pathname: location.pathname,
      search: queryString.stringify(newFilters),
    });
  };

  const handleRunRecon = async () => {
    setLoading(true);
    try {
      const data: ReconcileResponse = await window.api.reconGrabPos(filters);

      if (!data || data.length === 0) {
        toast.error("No reconciliation results found.");
        setResults([]);
        return;
      }

      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGrabImport = async () => {
    setLoading(true);
    try {
      const result = await window.api.startImportGrab();
      if (result.totalInserted === 0) {
        toast.error(`${result.message}`);
      } else {
        toast.success(`Inserted: ${result.message}`);
      }
    } catch (err: any) {
      toast.error(`Error ❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runToday = async () => {
    setLoading(true);
    try {
      const data: ReconcileResponse = await window.api.reconGrabPos({
        preset: "today",
        branch: filters.branch,
      });
      setResults(data);

      // Update URL to reflect "today" preset
      navigate({
        pathname: location.pathname,
        search: queryString.stringify({ branch: filters.branch, preset: "today" }),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    navigate({ pathname: location.pathname, search: "" });
  };

  const totalIssues = results.reduce((sum, group) => sum + group.issueCount, 0);
  const totalAmountPOS = results.reduce((sum, group) => sum + (group.totalPOSAmount ?? 0), 0);
  const totalAmountGrab = results.reduce((sum, group) => sum + (group.totalGrabAmount ?? 0), 0);
  const totalPayout = results.reduce((sum, group) => sum + (group.totalPayout ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">GrabFood Overview</h1>
          <p className="text-slate-500 font-medium mt-1">
            Select a record to view transactions or add a new grab record.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddGrab(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer">
            <span>+</span> Add Grab Record
          </button>
          <button
            onClick={handleStartGrabImport}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer">
            <span>+</span> Import Grab Folder
          </button>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-wrap items-end gap-4">
        {/* Branch */}
        <div className="flex-1 min-w-37.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
            Search Branch
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-slate-400">🔍</span>
            <select
              disabled={loading}
              value={filters.branch ?? ""}
              onChange={(e) => updateFilter("branch", e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500">
              <option value="">All</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* From */}
        <div className="w-40">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
            From
          </label>
          <input
            type="date"
            disabled={loading}
            value={filters.fromDate ?? ""}
            onChange={(e) => updateFilter("fromDate", e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* To */}
        <div className="w-40">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
            To
          </label>
          <input
            type="date"
            value={filters.toDate ?? ""}
            disabled={loading}
            min={filters.fromDate}
            onChange={(e) => updateFilter("toDate", e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Shortcuts & Actions */}
        <div className="flex gap-2">
          <button
            disabled={loading}
            onClick={runToday}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
            Today
          </button>

          {(filters.branch || filters.toDate || filters.fromDate) && (
            <button
              onClick={handleClearFilters}
              className="text-slate-400 hover:text-slate-600 px-3 py-2.5 text-xs font-bold transition-colors">
              Clear
            </button>
          )}
        </div>

        <button
          onClick={handleRunRecon}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {loading ? "Running…" : "Start"}
        </button>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {/* Header centered */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total Payout
            </p>

            {/* Tooltip */}
            <div className="relative group">
              <span className="cursor-pointer text-slate-400 hover:text-slate-600 text-md">ⓘ</span>
              <div className="absolute left-1/2 -translate-x-1/2 top-5 z-10 hidden group-hover:block w-56 bg-slate-900 text-white text-[10px] font-semibold p-2 rounded-lg shadow-lg">
                Total payout from Grab after deductions, adjustments, and fees.
              </div>
            </div>
          </div>

          {/* Value (not centered) */}
          <p className="text-3xl font-black text-slate-800 mt-1">₱{totalPayout.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {/* Header row */}
          <div className="grid grid-cols-3 text-center mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              POS Total
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              This Period
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Grab Total
            </p>
          </div>

          {/* Amounts row */}
          <div className="grid grid-cols-3 text-center">
            <p className="text-xl font-bold text-slate-800">₱{totalAmountPOS.toLocaleString()}</p>
            <p className="text-xl font-bold text-slate-800">—</p>
            <p className="text-xl font-bold text-slate-800">₱{totalAmountGrab.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Issues
          </p>
          <p className="text-3xl font-black text-red-500 mt-1">{totalIssues}</p>
        </div>
      </div>

      {/* SESSIONS GRID */}
      <div className="grid grid-cols-1 gap-4">
        {results.length > 0 ? (
          results.map((row) => (
            <Link
              to={{
                pathname: "/recon/grab/record",
                search: location.search, // keep current filters in URL
              }}
              state={row}
              key={`${row.branch}-${row.date}`}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="bg-slate-100 p-4 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  <span className="text-2xl">🚗</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-800">{row.branch}</h3>
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-mono">
                      #{row.totalCount}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">{row.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Issues</p>
                  <p className="font-bold text-slate-900">{row.issueCount}</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Match Rate</p>
                  <p className="font-bold text-slate-900">{row.matchRate}%</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                  {row.issueCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-full">
                      ⚠️{row.issueCount} Flagged
                    </span>
                  ) : (
                    <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">
                      ✅ Matched
                    </span>
                  )}
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  ➝
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-4xl mb-2">📅</p>
            <p className="font-bold">No records found in this date range.</p>
            <button
              onClick={handleClearFilters}
              className="text-indigo-600 font-bold text-sm mt-2 hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </div>

      {showAddGrab && <ImportGrabModal onClose={() => setShowAddGrab(false)} />}
    </div>
  );
};

export default GrabDashboard;
