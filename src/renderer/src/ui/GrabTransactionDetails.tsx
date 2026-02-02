import { TransactionRow } from "@renderer/constant/grabConstant";

const TransactionDetails = ({ r }: { r: TransactionRow }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-200 hidden md:block">
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    </div>

    {/* POS Side */}
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
        <DataRow label="Order Reference" value={r.cusno} />
        <DataRow label="Gross Amount" value={`₱${r.grschrg.toLocaleString()}`} />
        <DataRow
          label="Discount (POS)"
          value={`₱-${r.promo_amt.toLocaleString()}`}
          valueClass="text-rose-500 font-bold"
        />
        <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
          <span className="text-xs font-black text-indigo-600 uppercase">POS Net sales</span>
          <span className="text-lg font-black text-indigo-700">₱{r.balance.toLocaleString()}</span>
        </div>
      </div>
    </div>

    {/* Grab Side */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          External Grab Data
        </h4>
        <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold">
          Source: API
        </span>
      </div>
      {!r.grab_id ? (
        <div className="h-32 flex flex-col items-center justify-center text-rose-400 italic text-sm border-2 border-dashed border-rose-100 rounded-xl">
          <span className="font-black text-[10px] uppercase tracking-tighter">ID Mismatch</span>
          <span>No record found in Grab Import</span>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <DataRow
            label="Order Reference"
            value={r.booking_id}
            valueClass="font-mono text-xs font-bold"
          />
          <DataRow label="Gross Amount" value={`₱${r.amount?.toLocaleString()}`} />
          <DataRow
            label="Merchant Funded Discount"
            value={`₱${(r.discount_merchant_funded ?? 0).toLocaleString()}`}
            valueClass="text-rose-500 font-bold"
          />
          <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
            <span className="text-xs font-black text-emerald-600 uppercase">Grab Net Sales</span>
            <span className="text-lg font-black text-emerald-700">
              ₱{r.net_sales?.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>

    <div className="col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-2">
      <span className="text-xs font-bold text-slate-400 uppercase">Calculated Variance:</span>
      <span
        className={`text-xl font-black ${r.variance === 0 ? "text-emerald-500" : "text-rose-500"}`}>
        ₱{r.variance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  </div>
);

const DataRow = ({ label, value, valueClass = "font-bold text-slate-700" }: any) => (
  <div className="flex justify-between border-b border-slate-50 pb-2">
    <span className="text-slate-500 font-medium">{label}</span>
    <span className={valueClass}>{value}</span>
  </div>
);

export default TransactionDetails;
