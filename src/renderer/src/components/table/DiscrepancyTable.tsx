import Badge from "@renderer/components/ui/Badge";
import EmptyState from "@renderer/components/ui/EmptyState";
import { PHP } from "@renderer/lib/helpers";

export default function DiscrepancyTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return <EmptyState message="No discrepancies found. Great job!" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Branch</th>
            <th className="px-4 py-3">Partner</th>
            <th className="px-4 py-3">Slip No.</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">POS Amount</th>
            <th className="px-4 py-3 text-right">Partner Amount</th>
            <th className="px-4 py-3 text-right">Difference</th>
            <th className="px-4 py-3">Match Level</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => {
            const diff = Number(row.amount_difference ?? 0);
            return (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{String(row.branch_name)}</div>
                  <div className="text-xs text-slate-400">{String(row.branch)}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    value={String(row.partner_type)}
                    type={String(row.partner_type) === "GRAB" ? "grab" : "panda"}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                  {String(row.pos_cslipno)}
                </td>
                <td className="px-4 py-3 text-slate-600">{String(row.orddate)}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {PHP(row.pos_amount as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {PHP(row.partner_amount as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">
                  <span
                    className={
                      diff > 0 ? "text-red-500" : diff < 0 ? "text-amber-500" : "text-slate-400"
                    }>
                    {diff > 0 ? "+" : ""}
                    {PHP(diff)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    value={String(row.match_level)}
                    type={
                      String(row.match_level) === "EXACT"
                        ? "success"
                        : String(row.match_level) === "TOLERANCE"
                          ? "warn"
                          : "neutral"
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
