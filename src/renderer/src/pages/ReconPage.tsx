import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

const ReconPage = ({ partner }: { partner: "GRAB" | "PANDA" }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const api = (window as any).api;

  const refreshData = async () => {
    try {
      // Ensure you pass an object as the second argument
      const data = await api.fetchData(partner, { status: "ALL" });
      setItems(data);
    } catch (err) {
      console.error("IPC Call Failed:", err);
    }
  };

  const onRunMatcher = async () => {
    setLoading(true);
    const promise = api.runRecon(partner);

    toast.promise(promise, {
      loading: `Reconciling ${partner} transactions...`,
      success: () => {
        refreshData();
        return "Reconciliation complete!";
      },
      error: "Failed to run matcher.",
    });

    await promise;
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [partner]);

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50">
      <Toaster richColors />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900">{partner} RECON</h1>
        <button
          onClick={onRunMatcher}
          disabled={loading}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50">
          {loading ? "Processing..." : "Run Matcher"}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1 relative">
        {items.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">POS CusNo</th>
                <th className="px-6 py-4">POS Amount</th>
                <th className="px-6 py-4 text-indigo-500">Partner ID</th>
                <th className="px-6 py-4 text-indigo-500">Partner Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <StatusBadge status={item.recon_status} />
                  </td>

                  {/* POS Columns */}
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">
                    {item.pos_cusno || <span className="text-slate-300 italic">Not Found</span>}
                  </td>
                  <td
                    className={`px-6 py-4 font-bold ${!item.pos_amount ? "text-slate-300" : "text-slate-900"}`}>
                    ₱{item.pos_amount?.toLocaleString() || "0.00"}
                  </td>

                  {/* Partner Columns */}
                  <td className="px-6 py-4 font-mono text-sm text-indigo-600">
                    ...{item.partner_id?.slice(-8)}
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-900">
                    ₱{item.partner_amount?.toLocaleString() || "0.00"}
                  </td>

                  {/* Shared Date */}
                  <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                    {item.partner_date}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 font-bold text-xs uppercase hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* --- THE EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner">
              🔎
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No {partner} transactions found
            </h3>
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
              It looks like you haven't imported any data for this partner yet, or your current
              filters are hiding everything.
            </p>

            <div className="flex gap-4">
              <button
                onClick={onRunMatcher}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                Try Matching Now
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                Refresh Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: any = {
    MATCHED: "bg-emerald-100 text-emerald-700",
    FLAGGED: "bg-amber-100 text-amber-700",
    unreconciled: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-black uppercase ${colors[status] || colors.unreconciled}`}>
      {status || "Pending"}
    </span>
  );
};

export default ReconPage;
