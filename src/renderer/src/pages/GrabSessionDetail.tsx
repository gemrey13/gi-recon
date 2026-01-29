import ReviewModal from "@renderer/ui/modal/ReviewModel";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const GrabSessionDetail = () => {
  const { sessionId } = useParams(); // Get ID from URL (e.g., 101)
  const navigate = useNavigate();
  
  const [showReview, setShowReview] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);

  // In a real app, use useEffect to fetch data based on sessionId
  const [transactions, setTransactions] = useState([
    { id: 1, suffix: "AFAV", grab: 550, pos: 550, status: "MATCHED", notes: "" },
    { id: 2, suffix: "B8C2", grab: 120, pos: 110, status: "FLAGGED", notes: "Short payment" },
  ]);

  setTransactions;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* Session Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/recon/grab')} 
            className="bg-slate-100 hover:bg-slate-200 p-2 rounded-lg text-slate-500 transition-colors"
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">Session #{sessionId}</h2>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Daily</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Lucena Branch • Jan 29, 2026</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="text-right mr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Variance</p>
            <p className="text-lg font-bold text-red-500">₱ -10.00</p>
          </div>
          <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg">
            Generate Report
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="flex-1 overflow-auto p-8 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Grab Amt</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">POS Amt</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">{t.suffix}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">₱{t.grab}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-400">₱{t.pos}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${
                      t.status === 'MATCHED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setActiveItem(t); setShowReview(true); }}
                      className="text-slate-400 hover:text-indigo-600 font-bold text-xs border border-slate-200 hover:border-indigo-600 px-3 py-1 rounded-lg transition-all"
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

      {/* Insert ReviewModal Here */}
      {showReview && (
        <ReviewModal
           item={activeItem}
           onClose={() => setShowReview(false)}
           onSave={(status, notes) => console.log(status, notes)}
        />
      )}
    </div>
  );
};

export default GrabSessionDetail;