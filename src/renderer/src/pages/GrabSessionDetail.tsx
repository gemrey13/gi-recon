import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReviewModal from "@renderer/ui/modal/ReviewModel";
import { STATUS_MAP, TransactionRow } from "@renderer/constant/grabConstant";
import SessionHeader from "@renderer/ui/SessionHeader";
import TransactionDetails from "@renderer/ui/GrabTransactionDetails";

const GrabSessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [activeItem, setActiveItem] = useState<TransactionRow | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const data = await (window as any).api.fetchTransactions(Number(sessionId));
      setRows(data);
    })();
  }, [sessionId]);

  const handleGenerateReport = () => {
    console.log("Generating CSV/PDF for Session:", sessionId);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      <SessionHeader
        sessionId={sessionId}
        storeName={rows[0]?.store_name || "GrabFood Reconciliation"}
        onBack={() => navigate("/recon/grab")}
        onGenerate={handleGenerateReport}
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {["Transaction Info", "Grab Net", "POS Gross", "Status", "Actions"].map((h, i) => (
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
                const isOpen = expandedId === r.pos_id;
                const statusKey = (
                  r.grab_status || "discrepancy"
                ).toLowerCase() as keyof typeof STATUS_MAP;
                const style = STATUS_MAP[statusKey];

                return (
                  <React.Fragment key={r.pos_id}>
                    <tr
                      onClick={() => setExpandedId(isOpen ? null : r.pos_id)}
                      className={`group cursor-pointer transition-all border-l-4 ${isOpen ? "bg-slate-100" : style.rowHighlight}`}>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-mono font-black text-slate-900 leading-none">
                            {r.cusno}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                            {r.orddate}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-slate-700">
                        ₱{r.amount?.toLocaleString() ?? "0.00"}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-slate-700">
                        ₱{r.grschrg.toLocaleString()}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black ring-1 ring-inset shadow-sm ${style.bg} ${style.text} ${style.ring}`}>
                            <span
                              className={`h-2 w-2 rounded-full ${style.dot} ${statusKey !== "matched" ? "animate-pulse" : ""}`}
                            />
                            {style.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveItem(r);
                            setShowReview(true);
                          }}
                          className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all uppercase tracking-widest border ${statusKey === "matched" ? style.btn : `${style.btn} shadow-md active:scale-95`}`}>
                          {statusKey === "matched" ? "Review" : "Resolve"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td
                          colSpan={5}
                          className="bg-slate-50/50 px-8 py-10 border-y border-slate-100">
                          <TransactionDetails r={r} />
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

      {showReview && activeItem && (
        <ReviewModal
          item={activeItem}
          onClose={() => setShowReview(false)}
          onSave={(s, n) => console.log(s, n)}
        />
      )}
    </div>
  );
};

export default GrabSessionDetail;
