import NewReconModal from "@renderer/ui/modal/NewReconModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GrabDashboard = () => {
  const navigate = useNavigate();
  const [showNewRecon, setShowNewRecon] = useState(false);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD format

  // Mock Database Data
  const sessions = [
    { id: 101, date: "2026-01-29", displayDate: "Jan 29, 2026", branch: "Lucena", total: 45000, issues: 2, status: "Pending" },
    { id: 102, date: "2026-01-28", displayDate: "Jan 28, 2026", branch: "Lucena", total: 42100, issues: 0, status: "Completed" },
    { id: 103, date: "2026-01-29", displayDate: "Jan 29, 2026", branch: "Tayabas", total: 12500, issues: 5, status: "Pending" },
  ];

  // --- FILTER LOGIC ---
  const filteredSessions = sessions.filter(session => {
    // 1. Search ID (Convert ID to string to match)
    const matchesSearch = session.id.toString().includes(searchQuery);
    
    // 2. Filter Branch
    const matchesBranch = selectedBranch === "All" || session.branch === selectedBranch;

    // 3. Filter Date (Only if a date is selected)
    const matchesDate = dateFilter === "" || session.date === dateFilter;

    return matchesSearch && matchesBranch && matchesDate;
  });

  // --- HANDLER FOR "TODAY" SHORTCUT ---
  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0]; // Returns "2026-01-29"
    setDateFilter(today);
  };

  const handleStartRecon = () => {
    console.log("Processing Files...");
    setShowNewRecon(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">GrabFood Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Select a session to view transactions or start a new audit.</p>
        </div>
        <button 
          onClick={() => setShowNewRecon(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
        >
          <span>+</span> New Reconciliation
        </button>
      </div>

      {/* --- NEW FILTER TOOLBAR --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-wrap items-end gap-4">
        
        {/* Search ID */}
        <div className="flex-1 min-w-50">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Search Session ID</label>
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

        {/* Branch Select */}
        <div className="w-48">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Branch</label>
          <select 
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Branches</option>
            <option value="Lucena">Lucena</option>
            <option value="Tayabas">Tayabas</option>
            <option value="Pagbilao">Pagbilao</option>
          </select>
        </div>

        {/* Date Picker */}
        <div className="w-48">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Date</label>
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Today Shortcut Button */}
        <button 
          onClick={handleSetToday}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors mb-px"
        >
          Today
        </button>

        {/* Clear Filters (Optional) */}
        {(searchQuery || selectedBranch !== "All" || dateFilter) && (
          <button 
            onClick={() => { setSearchQuery(""); setSelectedBranch("All"); setDateFilter(""); }}
            className="text-slate-400 hover:text-slate-600 px-2 py-2.5 text-xs font-bold transition-colors mb-px"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* QUICK STATS ROW */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Required</p>
          <p className="text-3xl font-black text-slate-800 mt-1">7 <span className="text-red-500 text-sm font-bold">Issues</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">This Month</p>
          <p className="text-3xl font-black text-slate-800 mt-1">₱ 845,200</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Status</p>
          <p className="text-3xl font-black text-green-600 mt-1">Healthy</p>
        </div>
      </div>

      {/* SESSIONS GRID (Filtered) */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => navigate(`/recon/grab/${session.id}`)}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all flex justify-between items-center"
            >
              <div className="flex items-center gap-6">
                <div className="bg-slate-100 p-4 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  <span className="text-2xl">🚗</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-800">{session.branch} Branch</h3>
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-mono">#{session.id}</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">{session.displayDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Sales</p>
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
          /* EMPTY STATE WHEN FILTER RETURNS NOTHING */
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">🔍</p>
            <p className="font-bold">No sessions found matching your filters.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedBranch("All"); setDateFilter(""); }}
              className="text-indigo-600 font-bold text-sm mt-2 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {showNewRecon && <NewReconModal onClose={() => setShowNewRecon(false)} onProcess={handleStartRecon} />}
    </div>
  );
};

export default GrabDashboard;