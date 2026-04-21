import { GrabItem } from "@renderer/types/grabrecon";
import { useState } from "react";

interface UnmatchedGrabTableProps {
  items: GrabItem[];
  selectedGrab: GrabItem | null;
  onSelect: (item: GrabItem) => void;
}

/** Fixes the original operator-precedence bug in className logic */
const getStatusClass = (g: GrabItem): string => {
  if (g.category === "Adjustment") return "text-orange-500";
  if (g.status === "Cancelled") return "text-rose-500";
  return "text-emerald-500";
};

const UnmatchedGrabTable = ({ items, selectedGrab, onSelect }: UnmatchedGrabTableProps) => {
  const [useShortId, setUseShortId] = useState(false);

  return (
    <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-700">
          Unmatched Grab ({items.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr className="text-[10px] text-slate-400 uppercase">
              <th
                className="p-3 cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-1"
                onClick={() => setUseShortId((prev) => !prev)}
                title="Click to toggle ID format"
              >
                {useShortId ? "Short ID" : "Booking ID"}
                <span className="text-[8px] bg-slate-100 px-1 rounded text-slate-400">
                  Toggle
                </span>
              </th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {items.map((g) => (
              <tr
                key={g.id}
                onClick={() => onSelect(g)}
                className={`border-b border-slate-50 cursor-pointer transition-colors ${
                  selectedGrab?.id === g.id
                    ? "bg-amber-50 ring-1 ring-inset ring-amber-200"
                    : "hover:bg-slate-50"
                }`}
              >
                <td className="p-3">
                  <div className="font-semibold">
                    {useShortId ? g.short_order_id : g.booking_id}
                  </div>
                  <div className="text-slate-400 flex items-center gap-1">
                    {g.is_batched && (
                      <span className="bg-amber-100 text-amber-700 px-1 rounded text-[10px]">
                        BATCH ({g.id_count})
                      </span>
                    )}
                    <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                      <span>{g.created_on.split(" ")[0]}</span>
                      <br />
                      <span className={`font-semibold ${getStatusClass(g)}`}>
                        {g.category || g.status}
                      </span>
                      <br />
                      <span className="truncate">{g.store_name}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-right font-mono font-bold text-amber-600">
                  ₱{g.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnmatchedGrabTable;