const SessionHeader = ({ storeName, onBack, onGenerate }: any) => (
  <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-20">
    <div className="flex items-center gap-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm">
        <span className="text-lg">←</span> Back
      </button>
      <div className="h-8 w-px bg-slate-200" />
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black tracking-tight text-slate-800">Records</h2>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-widest">
            GrabFood
          </span>
        </div>
        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
          {storeName}
        </p>
      </div>
    </div>
    <button
      onClick={onGenerate}
      className="group flex items-center gap-4 bg-slate-900 hover:bg-indigo-600 text-white pl-5 pr-4 py-2 rounded-2xl transition-all shadow-lg shadow-slate-200 active:scale-95">
      <div className="flex flex-col items-start leading-tight">
        <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-100 uppercase tracking-widest">
          Action
        </span>
        <span className="text-sm font-bold">Generate Report</span>
      </div>

      {/* Replaced number with an icon for better UX */}
      <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
    </button>
  </header>
);

export default SessionHeader;
