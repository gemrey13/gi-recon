import { FilterState, ReconcileResponse } from "@renderer/types/results";
import ImportGrabModal from "@renderer/ui/modal/ImportGrabModal";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const GrabDashboard = () => {
  const [showAddGrab, setShowAddGrab] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [results, setResults] = useState<ReconcileResponse>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Load branch options
  useEffect(() => {
    window.api.getGrabBranches().then(setBranches);
  }, []);

  // 🔹 Handlers
  const updateFilter = (key: keyof FilterState, value?: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const handleRunRecon = async () => {
    setLoading(true);

    try {
      const results: ReconcileResponse = await window.api.reconGrabPos(filters);

      if (!results || results.length === 0) {
        toast.error("No reconciliation results found.");
        setResults([]);
        return;
      }
      console.log(results);
      setResults(results);
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
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const groupCount = results.length;

  const totalIssues = results.reduce((sum, group) => sum + group.issueCount, 0);

  // 🔹 total amount (choose POS or GRAB source)
  const totalAmount = results.reduce((sum, group) => {
    const groupTotal = group.items.reduce((s, item) => {
      const amount = item.pos?.totchrg ?? item.grab?.amount ?? 0;
      return s + amount;
    }, 0);

    return sum + groupTotal;
  }, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">GrabFood Overview</h1>
          <p className="text-slate-500 font-medium mt-1">
            Select a record to view transactions or add a new grab record.
          </p>
        </div>
        <button
          onClick={() => setShowAddGrab(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer">
          <span>+</span> Add Grab Record
        </button>
      </div>

      {/* --- FILTER TOOLBAR --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-wrap items-end gap-4">
        {/* Search ID */}
        <div className="flex-1 min-w-37.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
            Search Branch
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-slate-400">🔍</span>
            <select
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

        {/* From Date */}
        <div className="w-40">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
            From
          </label>
          <input
            type="date"
            value={filters.fromDate ?? ""}
            onChange={(e) => updateFilter("fromDate", e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* End Date */}
        <div className="w-40">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
            To
          </label>
          <input
            type="date"
            value={filters.toDate ?? ""}
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
          {loading ? "Running…" : "Run"}
        </button>
      </div>

      {/* QUICK STATS ROW (Dynamic based on filtered results could be cool here) */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Record Shown
          </p>
          <p className="text-3xl font-black text-slate-800 mt-1">{groupCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            This Period
          </p>
          <p className="text-3xl font-black text-slate-800 mt-1">₱{totalAmount.toLocaleString()}</p>
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
            <div
              key={`${row.branch}-${row.date}`}
              // onClick={() => navigate(`/recon/grab/${session.id}`)}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="bg-slate-100 p-4 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  <span className="text-2xl">🚗</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-800">{row.branch}</h3>
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-mono">
                      #{row.status}
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
            </div>
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
