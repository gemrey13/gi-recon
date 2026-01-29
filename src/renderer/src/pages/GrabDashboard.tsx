import NewReconModal from "@renderer/ui/modal/NewReconModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GrabDashboard = () => {
  const navigate = useNavigate();
  const [showNewRecon, setShowNewRecon] = useState(false);

  // Mock Database Data
  const sessions = [
    { id: 101, date: "Jan 29, 2026", branch: "Lucena", total: 45000, issues: 2, status: "Pending" },
    { id: 102, date: "Jan 28, 2026", branch: "Lucena", total: 42100, issues: 0, status: "Completed" },
    { id: 103, date: "Jan 29, 2026", branch: "Tayabas", total: 12500, issues: 5, status: "Pending" },
  ];

  const handleStartRecon = () => {
    // This is where your in-memory engine logic would run
    console.log("Processing Files...");
    setShowNewRecon(false);
    // After processing, you would save to DB and refresh historySessions
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
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

      {/* Quick Stats Row */}
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

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 gap-4">
        {sessions.map((session) => (
          <div 
            key={session.id}
            onClick={() => navigate(`/recon/grab/${session.id}`)} // LINK TO SINGLE PAGE
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all flex justify-between items-center"
          >
            <div className="flex items-center gap-6">
              <div className="bg-slate-100 p-4 rounded-xl group-hover:bg-indigo-50 transition-colors">
                <span className="text-2xl">🚗</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{session.branch} Branch</h3>
                <p className="text-slate-500 text-sm font-medium">{session.date}</p>
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
        ))}
      </div>

      {/* Insert NewReconModal here if needed */}
      {showNewRecon && <NewReconModal onClose={() => setShowNewRecon(false)} onProcess={handleStartRecon} />}
    </div>
  );
};

export default GrabDashboard;