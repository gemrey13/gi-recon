import Badge from "@renderer/components/ui/Badge";
import EmptyState from "@renderer/components/ui/EmptyState";
import { PHP } from "@renderer/lib/helpers";

export default function UnmatchedTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return <EmptyState message="No unmatched transactions." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Branch</th>
            <th className="px-4 py-3">Slip No.</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Partner</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-red-50 transition-colors">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-800">{String(row.branch_name)}</div>
                <div className="text-xs text-slate-400">{String(row.branch)}</div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{String(row.cslipno)}</td>
              <td className="px-4 py-3 text-slate-600">{String(row.orddate)}</td>
              <td className="px-4 py-3">
                <Badge
                  value={String(row.partner_type)}
                  type={
                    String(row.partner_type) === "GRAB"
                      ? "grab"
                      : String(row.partner_type) === "PANDA"
                        ? "panda"
                        : "neutral"
                  }
                />
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-medium text-red-500">
                {PHP(row.totchrg as number)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}