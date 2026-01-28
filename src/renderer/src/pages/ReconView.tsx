import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner"; // Import Sonner

const ReconView = ({ partner }: { partner: "GRAB" | "PANDA" }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const api = (window as any).api;

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getPartnerData(partner, {
        status: statusFilter,
        startDate: dateRange.start,
        endDate: dateRange.end,
      });
      setData(result);
    } catch (err) {
      toast.error("Failed to load data from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [partner, statusFilter, dateRange]);

  const handleRunRecon = async () => {
    setLoading(true);
    const promise = api.runReconciliation(); // Assume this returns a promise

    // Show a loading toast that updates when finished
    toast.promise(promise, {
      loading: "Analyzing transactions...",
      success: () => {
        loadData(); // Refresh table
        return `Reconciliation for ${partner} complete!`;
      },
      error: "Error running reconciliation engine.",
    });

    await promise;
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* 1. TOAST CONTAINER (Renders the alerts) */}
      <Toaster position="top-right" richColors />

      {/* ... Header and Filter Bar from previous step ... */}
      <div className="p-8 pb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {partner === "GRAB" ? "GrabFood" : "FoodPanda"} Recon
        </h2>
        <button
          onClick={handleRunRecon}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-400">
          Run Matcher
        </button>
      </div>

      {/* ... Filter Bar HTML ... */}

      <div className="px-8 pb-8 overflow-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">POS Info</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-indigo-500">
                  Partner Info
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm">{row.pos_id || "---"}</div>
                    <div className="font-bold text-slate-900">
                      ₱{row.pos_amount?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-indigo-50/20">
                    <div className="font-mono text-xs text-slate-500">
                      ...{row.partner_id.slice(-6)}
                    </div>
                    <div className="font-bold text-indigo-700">
                      ₱{row.partner_amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* 2. THE STATUS BADGE COMPONENT */}
                    <StatusBadge status={row.recon_status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toast.info(`Reviewing order ${row.partner_id}`)}
                      className="text-indigo-600 font-bold text-xs uppercase hover:underline">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* --- 3. THE STATUS BADGE COMPONENT DEFINITION --- */
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, string> = {
    MATCHED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    FLAGGED: "bg-amber-100 text-amber-700 border-amber-200",
    unreconciled: "bg-slate-100 text-slate-500 border-slate-200",
    RESOLVED: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const style = config[status] || config.unreconciled;

  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${style}`}>
      {status === "unreconciled" ? "Pending" : status}
    </span>
  );
};

export default ReconView;
