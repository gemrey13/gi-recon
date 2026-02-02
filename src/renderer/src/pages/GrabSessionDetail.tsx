import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReviewModal from "@renderer/ui/modal/ReviewModel";

type TransactionRow = {
  pos_id: number;
  grab_id: number | null;
  cusno: string;
  orddate: string;
  grschrg: number;
  promo_amt: number;
  booking_id: string | null;
  created_on: string | null;
  amount: number | null;
  discount_merchant_funded: number | null;
  net_sales: number | null;
  store_name: string | null;
  balance: number;
  variance: number;
  pos_status: string;
  grab_status: string;
  internal_notes?: string;
};

const GrabSessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [activeItem, setActiveItem] = useState<TransactionRow | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      const api = (window as any).api;
      const data = await api.fetchTransactions(Number(sessionId));
      setRows(data);
    };
    load();
  }, [sessionId]);

  const STATUS_MAP = {
    id_mismatch: {
      label: "ID MISMATCH",
      text: "text-rose-700",
      bg: "bg-rose-50",
      ring: "ring-rose-600/20",
      dot: "bg-rose-500",
      rowHighlight: "border-l-rose-500 bg-rose-50/30",
      btn: "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100",
    },
    discrepancy: {
      label: "DISCREPANCY",
      text: "text-amber-700",
      bg: "bg-amber-50",
      ring: "ring-amber-600/20",
      dot: "bg-amber-500",
      rowHighlight: "border-l-amber-500 bg-amber-50/30",
      btn: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100",
    },
    matched: {
      label: "MATCHED",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      ring: "ring-emerald-600/20",
      dot: "bg-emerald-500",
      rowHighlight: "border-l-transparent hover:bg-slate-50",
      btn: "text-slate-400 border-slate-200 hover:border-indigo-600 hover:text-indigo-600",
    },
  };

  const totalVariance = rows.reduce((sum, r) => sum + (r.variance || 0), 0);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/recon/grab")}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm">
            <span className="text-lg">←</span> Back to Sessions
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <h2 className="text-xl font-black tracking-tight">Session #{sessionId}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {rows[0]?.store_name || "GrabFood Reconciliation"}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Session Variance</p>
          <p
            className={`text-xl font-black ${totalVariance === 0 ? "text-emerald-600" : "text-rose-500"}`}>
            ₱{totalVariance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </header>

      {/* TABLE CONTAINER */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Transaction Info
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Grab Net
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    POS Gross
                  </th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
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
                        className={`group cursor-pointer transition-all border-l-4 ${
                          isOpen ? "bg-slate-100" : style.rowHighlight
                        }`}>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-slate-900">{r.cusno}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              POS Ref {r.orddate}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right font-bold text-slate-700">
                          ₱{r.amount?.toLocaleString() ?? "0.00"}
                        </td>

                        <td className="px-6 py-5 text-right font-bold text-slate-700">
                          ₱{r.grschrg.toLocaleString()}
                        </td>

                        {/* RECON STATUS CELL */}
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
                            className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all uppercase tracking-widest border ${
                              statusKey === "matched"
                                ? style.btn
                                : `${style.btn} shadow-lg active:scale-95`
                            }`}>
                            {statusKey === "matched" ? "Review" : "Resolve"}
                          </button>
                        </td>
                      </tr>

                      {/* DETAILED COMPARISON (ACCORDION) */}
                      {isOpen && (
                        <tr>
                          <td
                            colSpan={5}
                            className="bg-slate-50/50 px-8 py-8 border-y border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-200 hidden md:block">
                                <svg
                                  className="w-8 h-8"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                  />
                                </svg>
                              </div>

                              {/* POS SIDE */}
                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    Internal POS Data
                                  </h4>
                                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold">
                                    Source: System
                                  </span>
                                </div>
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between border-b border-slate-50 pb-2">
                                    <span className="text-slate-500 font-medium">
                                      Order Reference
                                    </span>
                                    <span className="font-bold">{r.cusno}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-50 pb-2">
                                    <span className="text-slate-500 font-medium">Gross Amount</span>
                                    <span className="font-bold">₱{r.grschrg.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">
                                      Discount (POS)
                                    </span>
                                    <span className="font-bold text-rose-500">
                                      ₱-{r.promo_amt.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                                    <span className="text-xs font-black text-indigo-600 uppercase">
                                      POS Net sales
                                    </span>
                                    <span className="text-lg font-black text-indigo-700">
                                      ₱{r.balance.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* GRAB SIDE */}
                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    External Grab Data
                                  </h4>
                                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold">
                                    Source: API
                                  </span>
                                </div>
                                {status === "ID_MISMATCH" ? (
                                  <div className="h-24 flex items-center justify-center text-slate-400 italic text-sm">
                                    No matching Grab transaction found
                                  </div>
                                ) : (
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                      <span className="text-slate-500 font-medium">
                                        Order Reference
                                      </span>
                                      <span className="font-bold font-mono text-xs">
                                        {r.booking_id}
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                      <span className="text-slate-500 font-medium">
                                        Gross Amount
                                      </span>
                                      <span className="font-bold">
                                        ₱{r.amount?.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500 font-medium">
                                        Merchant Funded Discount
                                      </span>
                                      <span className="font-bold text-rose-500">
                                        ₱{(r.discount_merchant_funded ?? 0).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                                      <span className="text-xs font-black text-emerald-600 uppercase">
                                        Grab Net Sales
                                      </span>
                                      <span className="text-lg font-black text-emerald-700">
                                        ₱{r.net_sales?.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* VARIANCE FOOTER */}
                              <div className="col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">
                                  Calculated Variance:
                                </span>
                                <span
                                  className={`text-xl font-black ${r.variance === 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                  ₱
                                  {r.variance.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            </div>
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

      {showReview && activeItem && (
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
