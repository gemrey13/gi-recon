import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SessionHeader from "@renderer/ui/SessionHeader";
import GrabTransactionDetails from "@renderer/ui/GrabTransactionDetails";
import { ReconcileGroup } from "@renderer/types/results";

const GrabGroupDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const group = location.state as ReconcileGroup;

  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!group) {
      // Redirect if no data
      navigate("/recon/grab");
    }
  }, [group, navigate]);

  const handleGenerateReport = () => {
    console.log("Generating CSV/PDF for Session:", group?.branch, group?.date);
  };

  const rows = group?.items || [];

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      <SessionHeader
        storeName={group?.branch || "GrabFood Reconciliation"}
        onBack={() => navigate("/recon/grab")}
        onGenerate={handleGenerateReport}
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {["Transaction Info", "POS Gross", "Grab Net", "Type", "Status"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${i === 3 ? "text-center" : i > 0 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const isOpen = expandedId === (r.pos?.id ?? r.grab?.id);
                const statusKey = (r.status || "discrepancy").toLowerCase() as
                  | "exact_match"
                  | "tolerance_match"
                  | "discrepancy"
                  | "unmatched"
                  | "chargeback_match";
                const style = STATUS_MAP[statusKey];

                return (
                  <React.Fragment key={r.pos?.id ?? r.grab?.id}>
                    <tr
                      onClick={() => setExpandedId(isOpen ? null : (r.pos?.id ?? r.grab?.id))}
                      className={`group cursor-pointer transition-all border-l-4 ${isOpen ? "bg-slate-100" : style.rowHighlight}`}>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-mono font-black text-slate-900 leading-none">
                            {r.pos?.cusno ?? r.grab?.short_order_id ?? "—"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                            {r.pos?.orddate ?? r.grab?.created_on ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-slate-700">
                        ₱{r.pos?.grschrg?.toLocaleString() ?? "0.00"}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-slate-700">
                        ₱{r.grab?.amount?.toLocaleString() ?? "0.00"}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                            r.grab?.order_type === "Auto-Chargeback"
                              ? "text-purple-600 border-purple-200 bg-purple-50"
                              : "text-slate-500 border-slate-200 bg-slate-50"
                          }`}>
                          {r.grab?.order_type || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black ring-1 ring-inset shadow-sm ${style.bg} ${style.text} ${style.ring}`}>
                            <span
                              className={`h-2 w-2 rounded-full ${style.dot} ${
                                statusKey !== "exact_match" ? "animate-pulse" : ""
                              }`}
                            />
                            {style.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td
                          colSpan={5}
                          className="bg-slate-50/50 px-8 py-10 border-y border-slate-100">
                          <GrabTransactionDetails r={r} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GrabGroupDetail;

const STATUS_MAP: Record<string, any> = {
  exact_match: {
    bg: "bg-green-50",
    text: "text-green-600",
    ring: "ring-green-500/20",
    dot: "bg-green-500",
    rowHighlight: "border-l-4 border-green-500",
    btn: "border-green-500 text-green-500 hover:bg-green-100",
    label: "Exact Match",
  },
  tolerance_match: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    ring: "ring-yellow-500/20",
    dot: "bg-yellow-500",
    rowHighlight: "border-l-4 border-yellow-500",
    btn: "border-yellow-500 text-yellow-500 hover:bg-yellow-100",
    label: "Tolerance Match",
  },
  discrepancy: {
    bg: "bg-red-50",
    text: "text-red-600",
    ring: "ring-red-500/20",
    dot: "bg-red-500",
    rowHighlight: "border-l-4 border-red-500",
    btn: "border-red-500 text-red-500 hover:bg-red-100",
    label: "Discrepancy",
  },
  unmatched: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    ring: "ring-gray-500/20",
    dot: "bg-gray-500",
    rowHighlight: "border-l-4 border-gray-500",
    btn: "border-gray-500 text-gray-500 hover:bg-gray-100",
    label: "Unmatched",
  },
  chargeback_match: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    ring: "ring-indigo-500/20",
    dot: "bg-indigo-500",
    rowHighlight: "border-l-4 border-indigo-500",
    btn: "border-indigo-500 text-indigo-500 hover:bg-indigo-100",
    label: "Chargeback Match",
  },
};
