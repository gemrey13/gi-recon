import EmptyState from "@renderer/components/ui/EmptyState";
import { PCT, PHP } from "@renderer/lib/helpers";

export default function BranchPerformanceTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return <EmptyState message="No branch performance data found." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Branch</th>
            <th className="px-4 py-3 text-right">POS Total</th>
            <th className="px-4 py-3 text-right">Grab Total</th>
            <th className="px-4 py-3 text-right">Panda Total</th>
            <th className="px-4 py-3 text-right">Partner Total</th>
            <th className="px-4 py-3 text-right">Variance</th>
            <th className="px-4 py-3 text-right">Match Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => {
            const variance = Number(row.total_variance ?? 0);
            const rate = Number(row.match_rate ?? 0);
            return (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{String(row.branch_name)}</div>
                  <div className="text-xs text-slate-400">{String(row.branch)}</div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {PHP(row.pos_total as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-green-600">
                  {PHP(row.grab_total as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-pink-600">
                  {PHP(row.panda_total as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  {PHP(row.partner_total as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span
                    className={
                      Math.abs(variance) > 0 ? "text-red-500 font-semibold" : "text-slate-400"
                    }>
                    {variance > 0 ? "+" : ""}
                    {PHP(variance)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-medium ${rate >= 90 ? "text-emerald-600" : rate >= 70 ? "text-amber-600" : "text-red-500"}`}>
                    {PCT(rate)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
