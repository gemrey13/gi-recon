import * as XLSX from "xlsx";
import parseDBF from "parsedbf";

export type ParsedRow = Record<string, unknown>;

// ---------------- Helper ----------------
function formatDateMMDDYYYY(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function parseDBFDate(date: any): string | null {
  if (!date) return null;

  // If it's already a Date object
  if (date instanceof Date && !isNaN(date.getTime())) {
    return formatDateMMDDYYYY(date);
  }

  // If it's a string like "11/14/2025" or "2025-11-14"
  if (typeof date === "string") {
    const parts = date.match(/\d+/g); // extract numbers
    if (!parts || parts.length < 3) return null;

    let mm = parts[0],
      dd = parts[1],
      yyyy = parts[2];

    // Handle possible YYYY-MM-DD
    if (yyyy.length === 4 && mm.length > 2) {
      [yyyy, mm, dd] = [mm, dd, yyyy];
    }

    return `${mm.padStart(2, "0")}/${dd.padStart(2, "0")}/${yyyy}`;
  }

  // If numeric YYYYMMDD
  if (typeof date === "number") {
    const s = date.toString();
    const yyyy = s.slice(0, 4);
    const mm = s.slice(4, 6);
    const dd = s.slice(6, 8);
    return `${mm}/${dd}/${yyyy}`;
  }

  return null;
}

// ---------------- POS (DBF) ----------------
export async function parsePOSFile(file: File, targetDate: string): Promise<ParsedRow[]> {
  if (!file) throw new Error("POS file missing.");
  if (!targetDate) throw new Error("Target date is required.");

  const arrayBuffer = await file.arrayBuffer();
  const dataView = new DataView(arrayBuffer);
  const dbfRecords = parseDBF(dataView);

  const rows = dbfRecords
    .map((r: any) => {
      const out: ParsedRow = {};

      Object.keys(r).forEach((key) => {
        let val = r[key];
        if (key.toUpperCase() === "ORDDATE") {
          val = parseDBFDate(val);
        } else if (typeof val === "string") val = val.trim();

        out[key.trim().toUpperCase()] = val;
      });

      return out;
    })
    .filter((r) => {
      return r.CUSNAME === "GRAB" && r.ORDDATE === targetDate; // match target date
    });

  if (!rows.length) throw new Error("No valid POS rows found.");
  return rows;
}

// ---------------- GRAB (CSV) ----------------
export async function parseGrabFile(file: File): Promise<ParsedRow[]> {
  if (!file) throw new Error("Grab file missing.");

  const text = await file.text();
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
        let val = r[i];

        // Normalize created_on to MM/DD/YYYY
        if (h === "created_on" && val != null) {
          const dateVal = String(val);
          const d = new Date(dateVal);
          if (!isNaN(d.getTime())) val = formatDateMMDDYYYY(d);
          else val = null;
        }

        out[h] = val;
      });
      return out;
    })
    .filter((r) => Object.keys(r).length > 0);

  if (!rows.length) throw new Error("No valid Grab rows found.");
  return rows;
}
