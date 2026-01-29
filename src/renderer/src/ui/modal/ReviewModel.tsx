import { useState } from "react";

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

export default ReviewModal;