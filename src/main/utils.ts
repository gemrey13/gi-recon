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
  if (!fs.existsSync(dbfPath)) {
    throw new Error("CHARGES.dbf not found");
  }

  console.log("Parsing DBF:", dbfPath);

  const buffer = await fs.promises.readFile(dbfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const dataView = new DataView(arrayBuffer);

  const parseFn = (parseDBF as any).default || parseDBF;
  const parsed = parseFn(dataView);

  // Handle differences between versions
  const records = Array.isArray(parsed) ? parsed : parsed.records;
  if (!records) throw new Error("No records found in DBF");

  const rows = records
    .map((r: any) => {
      const out: ParsedRow = { BRANCHCODE: branchCode };
      Object.keys(r).forEach((key) => {
        let val = r[key];
        if (typeof val === "string") val = val.trim();
        out[key.trim().toUpperCase()] = val;
      });
      return out;
    })
    .filter((r) => {
      const cus = r.CUSNAME?.toUpperCase();
      return cus === "GRAB" || cus === "PANDA";
    });

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
    })
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
    })
  );

  const result = allRows.flat();
  console.log(`Total POS rows parsed: ${result.length}`);
  return result;
}


// ------------------ Write CSV to Documents ------------------
// Writes POS rows to CSV in the Documents folder
export function writeCSVToDocuments(rows: ParsedRow[], fileName = "pos_output.csv") {
  if (!rows.length) return;

  // Get all headers from first row
  const headers = Object.keys(rows[0]);

  // Prepare CSV lines
  const csvLines = [
    headers.join(","), // header
    ...rows.map(r =>
      headers
        .map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`) // quote values, escape quotes
        .join(",")
    ),
  ];

  // Documents folder path
  const documentsDir = path.join(os.homedir(), "Documents");
  if (!fs.existsSync(documentsDir)) fs.mkdirSync(documentsDir);

  const filePath = path.join(documentsDir, fileName);
  fs.writeFileSync(filePath, csvLines.join("\n"), "utf8");

  console.log(`CSV written to ${filePath}`);
  return filePath;
}
