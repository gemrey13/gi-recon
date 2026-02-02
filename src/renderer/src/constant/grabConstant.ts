
// --- Types ---
export type TransactionRow = {
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

export const STATUS_MAP = {
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