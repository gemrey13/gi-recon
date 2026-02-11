import path from "path";
import os from "os";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import { exec } from "child_process";
import pLimit from "p-limit";
import { Worker } from "worker_threads";

export type ParsedRow = { [key: string]: any; BRANCHCODE: string };

// ------------------ Config ------------------
const POS_ROOT = "C:\\pos-data";
const BRANCHES = fs.readdirSync(POS_ROOT).filter(f => fs.statSync(path.join(POS_ROOT, f)).isDirectory());
const ZIP_PASSWORD = "admate";
const TMP_DIR = path.join(os.tmpdir(), "gi-recon");

// ------------------ Find ZIPs ------------------
function findZipFiles(dir: string, result: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) findZipFiles(fullPath, result);
    else if (entry.isFile() && entry.name.toUpperCase().startsWith("GC") && entry.name.toUpperCase().endsWith(".ZIP"))
      result.push(fullPath);
  }
  return result;
}

// ------------------ Extract ZIP (async) ------------------
function extractZip(zipPath: string, outputDir: string) {
  fs.mkdirSync(outputDir, { recursive: true });
  return new Promise<void>((resolve, reject) => {
    const cmd = `7z x "${zipPath}" -p${ZIP_PASSWORD} -o"${outputDir}" -y`;
    exec(cmd, (err) => (err ? reject(err) : resolve()));
  });
}

// ------------------ DBF Worker ------------------
function parseDbfWithWorker(dbfPath: string, branchCode: string): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(__dirname, "dbfWorker.js");
    const worker = new Worker(workerPath, { workerData: { dbfPath, branchCode } });

    worker.on("message", (msg: any) => {
      if (msg.error) reject(new Error(msg.error));
      else resolve(msg.rows);
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

// ------------------ Process single ZIP ------------------
async function processZip(branchCode: string, zipPath: string): Promise<ParsedRow[]> {
  const tempDir = path.join(TMP_DIR, branchCode, path.basename(zipPath, ".ZIP"));
  try {
    await extractZip(zipPath, tempDir);
    const dbfPath = path.join(tempDir, "CHARGES.dbf");
    if (!fs.existsSync(dbfPath)) return [];
    return parseDbfWithWorker(dbfPath, branchCode);
  } finally {
    // Async cleanup, non-blocking
    fs.rm(tempDir, { recursive: true, force: true }, () => {});
  }
}

// ------------------ Process single branch ------------------
async function processBranch(branchCode: string, branchPath: string): Promise<ParsedRow[]> {
  console.log(`\n> Processing branch: ${branchCode}`);
  const zipFiles = findZipFiles(branchPath);
  console.log(`   Found ${zipFiles.length} ZIP file(s)`);

  // Limit concurrency per branch to avoid too many threads
  const zipLimit = pLimit(Math.max(1, Math.floor(os.cpus().length / 2)));
  const allRows = await Promise.all(zipFiles.map(zip => zipLimit(() => processZip(branchCode, zip))));

  const rows = allRows.flat();
  console.log(`/ Branch ${branchCode} done -> ${rows.length} row(s) parsed`);
  return rows;
}

// ------------------ Process all branches ------------------
export async function readAllBranchesPOS() {
  console.log(`* Starting POS parse for ${BRANCHES.length} branch(es)`);
  const startTime = Date.now();

  const branchLimit = pLimit(os.cpus().length); // one branch per CPU core
  const allRows = await Promise.all(BRANCHES.map(branch =>
    branchLimit(() => processBranch(branch, path.join(POS_ROOT, branch)))
  ));

  const result = allRows.flat();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n| POS PARSE SUMMARY |`);
  console.log(`   Branches processed : ${BRANCHES.length}`);
  console.log(`   Total rows parsed  : ${result.length}`);
  console.log(`   Total time         : ${elapsed}s`);

  return result;
}

// ------------------ Write CSV ------------------
export async function writeCSVToDocuments(rows: ParsedRow[], fileName = "all_pos_branches.csv") {
  if (!rows.length) return;
  const filePath = path.join(os.homedir(), "Documents", fileName);

  const headers = Object.keys(rows[0]).map(h => ({ id: h, title: h }));
  const csvWriter = createObjectCsvWriter({ path: filePath, header: headers });

  const start = Date.now();
  await csvWriter.writeRecords(rows);
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);

  console.log(`📄 CSV written (${rows.length} rows) in ${elapsed}s → ${filePath}`);
}
