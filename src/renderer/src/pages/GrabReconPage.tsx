import { useState } from "react";

const GrabReconPage = () => {
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'detail'
  const [showNewRecon, setShowNewRecon] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // --- STATE FOR PERSISTENT DATA ---
  const [historySessions, setHistorySessions] = useState([
    { id: 101, date: "2026-01-29", branch: "Lucena", matched: 45, flagged: 2, status: "Completed" },
    { id: 102, date: "2026-01-28", branch: "Lucena", matched: 38, flagged: 0, status: "Completed" },
  ]);

  const [currentSessionData, setCurrentSessionData] = useState([
    { id: 1, suffix: "AFAV", date: "2026-01-29", partnerAmt: 550, posAmt: 550, status: "MATCHED", notes: "" },
    { id: 2, suffix: "B8C2", date: "2026-01-29", partnerAmt: 120, posAmt: 110, status: "FLAGGED", notes: "" },
  ]);

  // --- HANDLERS ---
  const handleStartRecon = () => {
    // This is where your in-memory engine logic would run
    console.log("Processing Files...");
    setShowNewRecon(false);
    // After processing, you would save to DB and refresh historySessions
  };

  const openReviewModal = (item) => {
    setSelectedItem(item);
    setShowReview(true);
  };

  const handleSaveReview = (newStatus, newNotes) => {
    // Update local state (in production, this would be a DB call)
    setCurrentSessionData(prev => prev.map(row => 
      row.id === selectedItem.id ? { ...row, status: newStatus, notes: newNotes } : row
    ));
    setShowReview(false);
  };

  return (
    <div className="p-8">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">GrabFood Reconciliation</h2>
          <p className="text-slate-500 text-sm">Manage and review daily grab transactions</p>
        </div>

        <button 
          onClick={() => setShowNewRecon(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
        >
          <span>+</span> New Recon
        </button>
      </div>

      {/* DASHBOARD LIST VIEW */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Session Date</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4 text-center">Matched</th>
                <th className="px-6 py-4 text-center">Flagged</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {historySessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold">{session.date}</td>
                  <td className="px-6 py-4 text-slate-600">{session.branch}</td>
                  <td className="px-6 py-4 text-center text-green-600 font-bold">{session.matched}</td>
                  <td className="px-6 py-4 text-center text-red-500 font-bold">{session.flagged}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setViewMode("detail")} className="text-indigo-600 font-bold hover:underline">
                      View Data →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* SESSION DETAIL VIEW */
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <button onClick={() => setViewMode("list")} className="text-slate-500 text-sm hover:text-indigo-600 mb-2 flex items-center gap-1 font-medium">
             ← Back to Sessions
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Detailed Transactions</h3>
              <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                Generate Report
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100 bg-white">
                <tr>
                  <th className="px-6 py-3">Order Suffix</th>
                  <th className="px-6 py-3 text-right">Grab Amt</th>
                  <th className="px-6 py-3 text-right">POS Amt</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {currentSessionData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{item.suffix}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">₱{item.partnerAmt}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-400">₱{item.posAmt}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        item.status === "MATCHED" ? "bg-green-100 text-green-700" : 
                        item.status === "FLAGGED" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => openReviewModal(item)}
                        className="bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL OVERLAYS */}
      {showNewRecon && <NewReconModal onClose={() => setShowNewRecon(false)} onProcess={handleStartRecon} />}
      {showReview && selectedItem && (
        <ReviewModal 
          item={selectedItem} 
          onClose={() => setShowReview(false)} 
          onSave={handleSaveReview} 
        />
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ReviewModal = ({ item, onClose, onSave }) => {
  const [status, setStatus] = useState(item.status);
  const [notes, setNotes] = useState(item.notes || "");

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 tracking-tight">Review Transaction</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</p>
              <p className="font-mono font-bold text-indigo-600 text-lg">{item.suffix}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Variance</p>
              <p className={`font-bold text-lg ${item.partnerAmt - item.posAmt === 0 ? 'text-slate-400' : 'text-red-500'}`}>
                ₱{item.partnerAmt - item.posAmt}
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block ml-1">Update Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="MATCHED">Matched</option>
              <option value="FLAGGED">Flagged (Pending)</option>
              <option value="RESOLVED">Resolved (Fixed)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block ml-1">Auditor Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain why you are resolving this gap..."
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-medium text-sm h-28 focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase text-[10px] tracking-widest">
            Cancel
          </button>
          <button
            onClick={() => onSave(status, notes)}
            className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all uppercase text-[10px] tracking-widest"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const NewReconModal = ({ onClose, onProcess }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">New Reconciliation</h3>
        <p className="text-slate-500 text-sm mb-8 font-medium">
          The engine will automatically group by branch and date.
        </p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group">
            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">📄</span>
            <p className="text-xs font-bold text-slate-600">POS Data (DBF)</p>
            <p className="text-[10px] text-slate-400 mt-1">Select File</p>
            <input type="file" className="hidden" />
          </label>

          <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group">
            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">📊</span>
            <p className="text-xs font-bold text-slate-600">Grab (XLSX)</p>
            <p className="text-[10px] text-slate-400 mt-1">Select File</p>
            <input type="file" className="hidden" />
          </label>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-400 uppercase text-[10px] tracking-widest">
            Cancel
          </button>
          <button
            onClick={onProcess}
            className="flex-2 bg-slate-900 text-white py-4 rounded-2xl font-black tracking-widest hover:bg-black transition-all uppercase text-xs"
          >
            Start Engine
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrabReconPage;