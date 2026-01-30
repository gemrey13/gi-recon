import NewGrabReconModal from "@renderer/ui/modal/NewGrabReconModal";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const GrabDashboard = () => {
  const navigate = useNavigate();
  const [showNewRecon, setShowNewRecon] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredSessions = sessions.filter((session) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    // Match either session ID or branch name
    const matchesId = session.id.toString().includes(query);
    const matchesBranch = session.branch.toLowerCase().includes(query);

    return matchesId || matchesBranch;
  });

  const handleSetToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  const fetchSessions = async () => {
    const api = (window as any).api;

    const result = await api.fetchSession({
      searchQuery,
      startDate,
      endDate,
    });

    if (result.error) {
      toast.error(result.error);
      setSessions([]);
    } else {
      setSessions(result);
    }
  };

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchSessions();
  }, [searchQuery, startDate, endDate]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">GrabFood Overview</h1>
          <p className="text-slate-500 font-medium mt-1">
            Select a session to view transactions or start a new audit.
          </p>
        </div>
        <button
          onClick={() => setShowNewRecon(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer">
          <span>+</span> New Reconciliation
        </button>
      </div>

      {/* --- FILTER TOOLBAR --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-wrap items-end gap-4">
        {/* Search ID */}
        <div className="flex-1 min-w-37.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
            Search ID
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="e.g. 101"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        

        {/* Start Date */}
        <div className="w-40">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
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
            value={endDate}
            min={startDate} // Prevent selecting an end date before start date
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Shortcuts & Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSetToday}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
            Today
          </button>

          {(searchQuery || startDate || endDate) && (
            <button
              onClick={handleClearFilters}
              className="text-slate-400 hover:text-slate-600 px-3 py-2.5 text-xs font-bold transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* QUICK STATS ROW (Dynamic based on filtered results could be cool here) */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Sessions Shown
          </p>
          <p className="text-3xl font-black text-slate-800 mt-1">{filteredSessions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            This Period
          </p>
          <p className="text-3xl font-black text-slate-800 mt-1">
            {/* Calculate Total for displayed sessions */}₱{" "}
            {filteredSessions.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Issues
          </p>
          <p className="text-3xl font-black text-red-500 mt-1">
            {filteredSessions.reduce((acc, curr) => acc + curr.issues, 0)}
          </p>
        </div>
      </div>

      {/* SESSIONS GRID */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => navigate(`/recon/grab/${session.id}`)}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="bg-slate-100 p-4 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  <span className="text-2xl">🚗</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-800">{session.branch} Branch</h3>
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-mono">
                      #{session.id}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">{session.displayDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total POS Amt</p>
                  <p className="font-bold text-slate-900">₱{session.total_pos.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total GRAB Amt</p>
                  <p className="font-bold text-slate-900">₱{session.total_grab.toLocaleString()}</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Payout</p>
                  <p className="font-bold text-slate-900">₱{session.total.toLocaleString()}</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                  {session.issues > 0 ? (
                    <span className="inline-flex items-center gap-1 text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-full">
                      {session.issues} Flagged
                    </span>
                  ) : (
                    <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">
                      Matched
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
            <p className="font-bold">No sessions found in this date range.</p>
            <button
              onClick={handleClearFilters}
              className="text-indigo-600 font-bold text-sm mt-2 hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </div>

      {showNewRecon && <NewGrabReconModal onClose={() => setShowNewRecon(false)} />}
    </div>
  );
};

export default GrabDashboard;
