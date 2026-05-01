export default function Badge({
  value,
  type,
}: {
  value: string | number;
  type: "success" | "danger" | "warn" | "neutral" | "grab" | "panda";
}) {
  const cls = {
    success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    danger: "bg-red-100 text-red-700 border border-red-200",
    warn: "bg-amber-100 text-amber-700 border border-amber-200",
    neutral: "bg-slate-100 text-slate-600 border border-slate-200",
    grab: "bg-green-100 text-green-700 border border-green-200",
    panda: "bg-pink-100 text-pink-700 border border-pink-200",
  }[type];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  );
}
