import fs from "fs";
import parseDBF from "parsedbf";
import { getAllBranches, getPosDataPath } from "./config";
import os from "os";
import path from "path";
import Seven from "node-7z";
import { path7za } from "7zip-bin";

export type ParsedRow = {
  [key: string]: any;
  BRANCHCODE: string;
};

// ------------------ Parse DBF ------------------
export async function parsePOSDbfFile(dbfPath: string, branchCode: string): Promise<ParsedRow[]> {
  if (!fs.existsSync(dbfPath)) throw new Error("CHARGES.dbf not found");

  const buffer = await fs.promises.readFile(dbfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const dataView = new DataView(arrayBuffer);

  const parseFn = (parseDBF as any).default || parseDBF;
  const parsed = parseFn(dataView);
  const records = Array.isArray(parsed) ? parsed : parsed.records;
  if (!records) return [];

  // PH timezone now
  const now = new Date();
  const phOffset = 8 * 60; // +8:00 in minutes
  const phToday = new Date(now.getTime() + (phOffset - now.getTimezoneOffset()) * 60000);
  const currentYear = phToday.getFullYear();

  const rows: ParsedRow[] = [];

  for (const r of records) {
    const cus = (r.CUSNAME ?? "").toUpperCase();
    if (cus !== "GRAB" && cus !== "PANDA") continue; // skip others

    let orderDateStr = r.ORDDATE;
    let dt: Date | null = null;

    if (orderDateStr instanceof Date) dt = orderDateStr;
    else if (typeof orderDateStr === "string" && /^\d{8}$/.test(orderDateStr)) {
      // parse YYYYMMDD
      dt = new Date(
        `${orderDateStr.slice(0, 4)}-${orderDateStr.slice(4, 6)}-${orderDateStr.slice(6, 8)}`,
      );
    }
    if (!dt) continue;

    // Only include current year
    if (dt.getFullYear() !== currentYear) continue;

    // Format MM/DD/YYYY
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const yyyy = dt.getFullYear();

    const out: ParsedRow = { BRANCHCODE: branchCode };

    for (const key of Object.keys(r)) {
      let val = r[key];
      if (key.toUpperCase() === "ORDDATE") val = `${mm}/${dd}/${yyyy}`;
      else if (typeof val === "string") val = val.trim();
      out[key.trim().toUpperCase()] = val;
    }

    rows.push(out);
  }

  return rows;
}

// ------------------ Find ZIP Files ------------------
export function findZipFiles(dir: string, result: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findZipFiles(fullPath, result);
    } else if (
      entry.isFile() &&
      entry.name.toUpperCase().startsWith("GC") &&
      entry.name.toUpperCase().endsWith(".ZIP")
    ) {
      result.push(fullPath);
    }
  }

  return result;
}

// ------------------ Extract ZIP ------------------
export async function extractZip(zipPath: string, outputDir: string): Promise<void> {
  fs.mkdirSync(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const stream = Seven.extractFull(zipPath, outputDir, {
      password: "admate",
      $bin: path7za,
    });

    stream.on("end", resolve);
    stream.on("error", reject);
  });
}

// ------------------ Process a single branch ------------------
export async function processBranch(branchCode: string, branchPath: string): Promise<ParsedRow[]> {
  const zipFiles = findZipFiles(branchPath);

  const allRows: ParsedRow[][] = await Promise.all(
    zipFiles.map(async (zip) => {
      const tempDir = path.join(os.tmpdir(), "gi-recon", branchCode, path.basename(zip, ".ZIP"));
      try {
        await extractZip(zip, tempDir);
        const dbfPath = path.join(tempDir, "CHARGES.dbf");
        if (!fs.existsSync(dbfPath)) return [];

        const rows = await parsePOSDbfFile(dbfPath, branchCode);
        return rows;
      } catch (err) {
        console.error(`Failed to process zip ${zip}`, err);
        return [];
      } finally {
        await new Promise((r) => setTimeout(r, 50));
        try {
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch (rmErr) {
          console.warn(`Failed to delete temp dir: ${tempDir}`, rmErr);
        }
      }
    }),
  );

  return allRows.flat();
}

// ------------------ Read all branches ------------------
export async function readAllBranchesPOS(): Promise<ParsedRow[]> {
  const root = getPosDataPath();
  if (!root) throw new Error("POS data path not set");

  const branches = getAllBranches();

  const allRows: ParsedRow[][] = await Promise.all(
    branches.map(async (branch) => {
      const branchPath = path.join(root, branch);
      return processBranch(branch, branchPath);
    }),
  );

  const result = allRows.flat();
  console.log(`Total POS rows parsed: ${result.length}`);
  return result;
}

// ------------------ Write CSV to Documents ------------------
// Writes POS rows to CSV in the Documents folder
import { createObjectCsvWriter } from "csv-writer";

export async function writeCSVToDocuments(rows: ParsedRow[], fileName = "pos_output.csv") {
  if (!rows.length) return;

  const documentsDir = path.join(os.homedir(), "Documents");
  const filePath = path.join(documentsDir, fileName);

  const headers = Object.keys(rows[0]).map((h) => ({ id: h, title: h }));

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await csvWriter.writeRecords(rows);
  console.log(`CSV written to ${filePath}`);
  return filePath;
}
