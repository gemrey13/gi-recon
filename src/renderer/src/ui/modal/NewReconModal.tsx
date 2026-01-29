
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

export default NewReconModal;