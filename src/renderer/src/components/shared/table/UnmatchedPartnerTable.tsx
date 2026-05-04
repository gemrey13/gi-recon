// UnmatchedPartnerTable.tsx
import {
  PartnerType,
  UnmatchedGrabTransaction,
  UnmatchedPandaTransaction,
  UnmatchedPartnerTransaction,
} from "@shared/recon.types";
import { useState } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const PARTNER_CONFIG: Record<PartnerType, { label: string; accentClass: string }> = {
  GRAB: { label: "Grab", accentClass: "text-green-600" },
  PANDA: { label: "foodpanda", accentClass: "text-pink-600" },
};

// ─── Grab-specific helpers ────────────────────────────────────────────────────

const getGrabStatusClass = (g: UnmatchedGrabTransaction): string => {
  if (g.category === "Adjustment") return "text-orange-500";
  if (g.status === "Cancelled") return "text-rose-500";
  return "text-emerald-500";
};

// ─── Row renderers ────────────────────────────────────────────────────────────

interface GrabRowProps {
  item: UnmatchedGrabTransaction;
  useShortId: boolean;
}

const GrabRow = ({ item: g, useShortId }: GrabRowProps) => (
  <>
    <td className="p-3">
      <div className="font-semibold">{useShortId ? g.short_order_id : g.booking_id}</div>
      <div className="text-slate-400 flex items-center gap-1">
        {g.is_batched && (
          <span className="bg-amber-100 text-amber-700 px-1 rounded text-[10px]">
            BATCH ({g.id_count})
          </span>
        )}
        <div className="text-[10px] text-slate-400 mt-1 leading-tight">
          <span>{g.created_on.split(" ")[0]}</span>
          <br />
          <span className={`font-semibold ${getGrabStatusClass(g)}`}>{g.category || g.status}</span>
          <br />
          <span className="truncate">{g.store_name}</span>
        </div>
      </div>
    </td>
    <td className="p-3 text-right font-mono font-bold text-amber-600">
      ₱{g.amount.toLocaleString()}
    </td>
  </>
);

const PandaRow = ({ item: f }: { item: UnmatchedPandaTransaction }) => (
  <>
    <td className="p-3">
      <div className="font-semibold">{f.order_code ?? "—"}</div>
      <div className="font-semibold text-[10px] text-slate-400 mt-1 leading-tight">
        <span>{f.order_date}</span>
        <br />
        <span className="truncate">{f.partner_name}</span>
      </div>
    </td>
    <td className="p-3 text-right font-mono font-bold text-amber-600">
      ₱{f.gross_food_value.toLocaleString()}
    </td>
  </>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface UnmatchedPartnerTableProps {
  partnerType: PartnerType;
  items: UnmatchedPartnerTransaction[];
  /** All currently selected partner rows (basket) */
  partnerBasket: UnmatchedPartnerTransaction[];
  onToggle: (item: UnmatchedPartnerTransaction) => void;
  sort: "asc" | "desc" | null;
  onSortChange: (sort: "asc" | "desc" | null) => void;
}

const UnmatchedPartnerTable = ({
  partnerType,
  items,
  partnerBasket,
  onToggle,
  sort,
  onSortChange,
}: UnmatchedPartnerTableProps) => {
  const [useShortId, setUseShortId] = useState(false);
  const { label, accentClass } = PARTNER_CONFIG[partnerType];
  const isGrab = partnerType === "GRAB";

  return (
    <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-700">
          Unmatched <span className={accentClass}>{label}</span> ({items.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr className="text-[10px] text-slate-400 uppercase">
              <th className="p-3">Select</th>
              <th
                className={`p-3 ${isGrab ? "cursor-pointer hover:text-indigo-600 transition-colors" : ""} flex items-center gap-1`}
                onClick={isGrab ? () => setUseShortId((prev) => !prev) : undefined}
                title={isGrab ? "Click to toggle ID format" : undefined}>
                {isGrab ? (useShortId ? "Short ID" : "Booking ID") : "Order Details"}
                {isGrab && (
                  <span className="text-[8px] bg-slate-100 px-1 rounded text-slate-400">
                    Toggle
                  </span>
                )}
              </th>
              <th
                className="p-3 text-right cursor-pointer select-none"
                onClick={() =>
                  onSortChange(sort === "asc" ? "desc" : sort === "desc" ? null : "asc")
                }>
                Amount {sort === "asc" ? "↑" : sort === "desc" ? "↓" : "↕"}
              </th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {items.map((item) => {
              const isSelected = partnerBasket.some((p) => p.id === item.id);
              return (
                <tr
                  key={item.id}
                  onClick={() => onToggle(item)}
                  className={`border-b border-slate-50 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-amber-50 ring-1 ring-inset ring-amber-200"
                      : "hover:bg-slate-50"
                  }`}>
                  <td className="p-3">
                    <input type="checkbox" checked={isSelected} readOnly />
                  </td>
                  {isGrab ? (
                    <GrabRow item={item as UnmatchedGrabTransaction} useShortId={useShortId} />
                  ) : (
                    <PandaRow item={item as UnmatchedPandaTransaction} />
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnmatchedPartnerTable;
