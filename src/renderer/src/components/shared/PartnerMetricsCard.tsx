import { FiAlertCircle, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const PartnerMetricsCard = ({ reconData }: { reconData: any }) => {
  
  const formatDate = (dateStr: any) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Reconciliation Overview: <span className="text-slate-900">{reconData.range.branch}</span>
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
          {formatDate(reconData.range.startDate)}
          {reconData.range.endDate !== reconData.range.startDate
            ? ` to ${formatDate(reconData.range.endDate)}`
            : ""}
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MATCHED CARD */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FiCheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Auto-Matched</p>
              <p className="text-2xl font-black text-slate-900">{reconData.matched.length}</p>
            </div>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{
                width: `${(reconData.matched.length / (reconData.matched.length + reconData.unmatchedPos.length)) * 100}%`,
              }}></div>
          </div>
        </div>

        {/* UNMATCHED POS CARD */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <FiAlertCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Unmatched POS</p>
              <p className="text-2xl font-black text-slate-900">{reconData.unmatchedPos.length}</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 italic">
            Transactions in POS but not in Grab
          </p>
        </div>

        {/* UNMATCHED GRAB CARD */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FiAlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Unmatched Grab</p>
              <p className="text-2xl font-black text-slate-900">{reconData.unmatchedPartner.length}</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 italic">Payments in Grab but not in POS</p>
        </div>

        {/* TOTAL VALUE (Optional but helpful) */}
        <div className="bg-indigo-600 p-5 rounded-2xl border border-indigo-700 shadow-sm shadow-indigo-100">
          <p className="text-xs font-semibold text-indigo-100 uppercase">Total Items Found</p>
          <p className="text-2xl font-black text-white">
            {reconData.matched.length +
              reconData.unmatchedPos.length +
              reconData.unmatchedPartner.length}
          </p>
          <div className="mt-2 text-[10px] text-indigo-200">Processing complete</div>
        </div>
      </div>
    </div>
  );
};

export default PartnerMetricsCard;
