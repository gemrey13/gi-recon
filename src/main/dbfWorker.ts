import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import parseDBF from "parsedbf";

type ParsedRow = { [key: string]: any; BRANCHCODE: string };

const ZIP_PASSWORD = "admate";

// ------------------ Parse DBF ------------------
async function parsePOSDbfFile(dbfPath: string, branchCode: string): Promise<ParsedRow[]> {
  if (!fs.existsSync(dbfPath)) throw new Error("CHARGES.dbf not found");

  const buffer = await fs.promises.readFile(dbfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const dataView = new DataView(arrayBuffer);

  const parseFn = (parseDBF as any).default || parseDBF;
  const parsed = parseFn(dataView);
  const records = Array.isArray(parsed) ? parsed : parsed.records;
  if (!records) return [];

  const now = new Date();
  const phOffset = 8 * 60;
  const phToday = new Date(now.getTime() + (phOffset - now.getTimezoneOffset()) * 60000);
  const currentYear = phToday.getFullYear();

  const rows: ParsedRow[] = [];

  for (const r of records) {
    const cus = (r.CUSNAME ?? "").toUpperCase();
    if (cus !== "GRAB" && cus !== "PANDA") continue;

    let orderDateStr = r.ORDDATE;
    let dt: Date | null = null;

    if (orderDateStr instanceof Date) dt = orderDateStr;
    else if (typeof orderDateStr === "string" && /^\d{8}$/.test(orderDateStr)) {
      dt = new Date(`${orderDateStr.slice(0, 4)}-${orderDateStr.slice(4, 6)}-${orderDateStr.slice(6, 8)}`);
    }
    if (!dt) continue;
    if (dt.getFullYear() !== currentYear) continue;

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

// ------------------ Extract ZIP ------------------
async function extractZip(zipPath: string, outputDir: string) {
  fs.mkdirSync(outputDir, { recursive: true });

  return new Promise<void>((resolve, reject) => {
    const cmd = `7z x "${zipPath}" -p${ZIP_PASSWORD} -o"${outputDir}" -y`;
    exec(cmd, (err) => (err ? reject(err) : resolve()));
  });
}


// ------------------ Main ------------------
(async () => {
  if (!parentPort) return;

  try {
    const { zipPath, branchCode, tmpDir } = workerData;

    const extractDir = path.join(tmpDir, path.basename(zipPath, ".ZIP"));
    await extractZip(zipPath, extractDir);

    const dbfPath = path.join(extractDir, "CHARGES.dbf");
    if (!fs.existsSync(dbfPath)) {
      parentPort.postMessage({ rows: [] });
      return;
    }

    const rows = await parsePOSDbfFile(dbfPath, branchCode);

    // Clean up
    await fs.promises.rm(extractDir, { recursive: true, force: true });

    parentPort.postMessage({ rows });
  } catch (err: any) {
    parentPort.postMessage({ error: err.message || String(err) });
  }
})();


