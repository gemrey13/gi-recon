import Badge from "@renderer/components/ui/Badge";
import EmptyState from "@renderer/components/ui/EmptyState";
import { fmt, PHP } from "@renderer/lib/helpers";


export default function PartnerSalesTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return <EmptyState message="No partner sales data found." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Branch</th>
            <th className="px-4 py-3">Partner</th>
            <th className="px-4 py-3 text-right">Orders</th>
            <th className="px-4 py-3 text-right">Gross Sales</th>
            <th className="px-4 py-3 text-right">Commission</th>
            <th className="px-4 py-3 text-right">WHT</th>
            <th className="px-4 py-3 text-right">Total Fees</th>
            <th className="px-4 py-3 text-right">Net Sales</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-800">{String(row.branch_name)}</td>
              <td className="px-4 py-3">
                <Badge
                  value={String(row.partner_type)}
                  type={String(row.partner_type) === "GRAB" ? "grab" : "panda"}
                />
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {fmt(row.total_orders as number)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {PHP(row.gross_sales as number)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-red-400">
                {PHP(row.commission_amt as number)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-red-400">
                {PHP(row.withholding_tax as number)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-red-400">
                {PHP(row.total_fees as number)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold text-emerald-600">
                {PHP(row.net_sales as number)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}