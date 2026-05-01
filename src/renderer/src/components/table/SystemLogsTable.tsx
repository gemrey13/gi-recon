import Badge from "@renderer/components/ui/Badge";
import EmptyState from "@renderer/components/ui/EmptyState";

export default function SystemLogsTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return <EmptyState message="No system logs found." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Level</th>
            <th className="px-4 py-3">Module</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">User</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-mono text-xs">
          {data.map((row, i) => {
            const level = String(row.level);
            return (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                  {String(row.timestamp)}
                </td>
                <td className="px-4 py-2.5">
                  <Badge
                    value={level}
                    type={
                      level === "ERROR"
                        ? "danger"
                        : level === "WARN"
                          ? "warn"
                          : level === "INFO"
                            ? "success"
                            : "neutral"
                    }
                  />
                </td>
                <td className="px-4 py-2.5 text-indigo-600">{String(row.module)}</td>
                <td className="px-4 py-2.5 text-slate-600">{String(row.action)}</td>
                <td
                  className="px-4 py-2.5 text-slate-700 max-w-xs truncate"
                  title={String(row.message)}>
                  {String(row.message)}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{String(row.user_name)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
