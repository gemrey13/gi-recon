import { PosItem } from "@renderer/types/grabrecon";

interface UnmatchedPosTableProps {
  items: PosItem[];
  basket: PosItem[];
  onToggle: (item: PosItem) => void;
}

const UnmatchedPosTable = ({ items, basket, onToggle }: UnmatchedPosTableProps) => (
  <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <div className="p-3 bg-slate-50 border-b border-slate-200">
      <h3 className="text-sm font-bold text-slate-700">
        Unmatched POS ({items.length})
      </h3>
    </div>

    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-white shadow-sm z-10">
          <tr className="text-[10px] text-slate-400 uppercase">
            <th className="p-3">Select</th>
            <th className="p-3">Branch / Date</th>
            <th className="p-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="text-xs">
          {items.map((p) => {
            const isSelected = basket.some((x) => x.id === p.id);
            return (
              <tr
                key={p.id}
                onClick={() => onToggle(p)}
                className={`border-b border-slate-50 cursor-pointer transition-colors ${
                  isSelected ? "bg-indigo-50" : "hover:bg-slate-50"
                }`}
              >
                <td className="p-3">
                  <input type="checkbox" checked={isSelected} readOnly />
                </td>
                <td className="p-3">
                  <div className="font-semibold">{p.cusno}</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                    <span>{p.orddate}</span>
                    <br />
                    <span>{p.branch_name}</span>
                  </div>
                </td>
                <td className="p-3 text-right font-mono font-bold text-indigo-600">
                  ₱{p.amount.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default UnmatchedPosTable;