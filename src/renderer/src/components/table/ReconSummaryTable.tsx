import EmptyState from "@renderer/components/ui/EmptyState";
import { fmt, PCT, PHP } from "@renderer/lib/helpers";

export default function ReconSummaryTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return <EmptyState message="No reconciliation data found." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Branch</th>
            <th className="px-4 py-3 text-right">Total POS</th>
            <th className="px-4 py-3 text-right">Matched</th>
            <th className="px-4 py-3 text-right">Unmatched</th>
            <th className="px-4 py-3 text-right">Exact</th>
            <th className="px-4 py-3 text-right">Tolerance</th>
            <th className="px-4 py-3 text-right">Manual</th>
            <th className="px-4 py-3 text-right">Match Rate</th>
            <th className="px-4 py-3 text-right">POS Amount</th>
            <th className="px-4 py-3 text-right">Total Variance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => {
            const rate = Number(row.match_rate ?? 0);
            return (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">
                  <div>{String(row.branch_name)}</div>
                  <div className="text-xs text-slate-400">{String(row.branch)}</div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {fmt(row.total_pos as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-emerald-600 font-medium">
                  {fmt(row.matched as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-red-500">
                  {fmt(row.unmatched as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                  {fmt(row.exact_matches as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                  {fmt(row.tolerance_matches as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                  {fmt(row.manual_matches as number)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${rate >= 90 ? "bg-emerald-500" : rate >= 70 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${Math.min(rate, 100)}%` }}
                      />
                    </div>
                    <span
                      className={`font-medium ${rate >= 90 ? "text-emerald-600" : rate >= 70 ? "text-amber-600" : "text-red-500"}`}>
                      {PCT(row.match_rate as number)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {PHP(row.total_pos_amount as number)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span
                    className={
                      Number(row.total_variance) > 0 ? "text-red-500 font-medium" : "text-slate-500"
                    }>
                    {PHP(row.total_variance as number)}
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