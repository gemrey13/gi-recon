export const PHP = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);

export const PCT = (n: number | null | undefined) => (n == null ? "—" : `${Number(n).toFixed(1)}%`);

export const fmt = (n: number | null | undefined) =>
  n == null ? "—" : Number(n).toLocaleString("en-PH");

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
