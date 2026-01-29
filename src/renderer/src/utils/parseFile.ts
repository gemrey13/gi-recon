import * as XLSX from "xlsx";
import parseDBF from "parsedbf";

export type ParsedRow = Record<string, unknown>;

/* ---------------- POS (DBF) ---------------- */

export async function parsePOSFile(file: File): Promise<ParsedRow[]> {
  if (!file) throw new Error("POS file missing.");

  const arrayBuffer = await file.arrayBuffer();
  const dataView = new DataView(arrayBuffer);

  const dbfRecords = parseDBF(dataView);

  const targetDate = new Date("2025-11-14"); // simulated
  const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const rows = dbfRecords
    .filter((r: any) => {
      // 1️⃣ CUSNAME check
      const cusName = typeof r.CUSNAME === "string" && r.CUSNAME.trim().toUpperCase() === "GRAB";

      // 2️⃣ ORDDATE check
      let orderDate: Date | null = null;

      if (r.ORDDATE instanceof Date) {
        orderDate = r.ORDDATE;
      } else if (typeof r.ORDDATE === "string") {
        const parsed = new Date(r.ORDDATE);
        if (!isNaN(parsed.getTime())) orderDate = parsed;
      }

      if (!orderDate) return false;

      const isDateMatch =
        normalizeDate(orderDate).getTime() === normalizeDate(targetDate).getTime();

      return cusName && isDateMatch;
    })
    .map((r: any) => {
      const out: ParsedRow = {};
      Object.keys(r).forEach((key) => {
        const cleanKey = key.trim().toUpperCase();
        const val = r[key];
        out[cleanKey] = typeof val === "string" ? val.trim() : val;
      });
      return out;
    });

  if (!rows.length) throw new Error("No valid POS rows found.");

  return rows;
}

/* ---------------- GRAB (CSV) ---------------- */

export async function parseGrabFile(file: File): Promise<ParsedRow[]> {
  if (!file) throw new Error("Grab file missing.");

  const text = await file.text();

  // XLSX can read CSV from string
  const workbook = XLSX.read(text, { type: "string" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: null,
  }) as unknown[][];

  if (!matrix.length) throw new Error("Grab CSV is empty.");

  const headers = matrix[0].map((h) => String(h).trim().toLowerCase().replace(/ /g, "_"));

  const dataRows = matrix.slice(1);

  const rows = dataRows
    .map((r) => {
      const out: ParsedRow = {};
      headers.forEach((h, i) => {
        if (h) out[h] = r[i];
      });
      return out;
    })
    .filter((r) => Object.keys(r).length > 0);

  if (!rows.length) throw new Error("No valid Grab rows found.");
  return rows;
}
