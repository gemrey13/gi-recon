import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { DBFFile } from "dbffile";
import os from "os";
import { formatString, toNumber, toSqliteDateTime } from "../../utils";

const { branches, rootFolder, batchSize, year, zipPassword } = workerData as {
  branches: string[];
  rootFolder: string;
  batchSize: number;
  year: number;
  zipPassword: string;
};

const ZIP_PASSWORD = zipPassword;

// Sanitize generic values
function sanitizeValue(value: any) {
  if (value == null) return null;
  if (value instanceof Date) return toSqliteDateTime(value);
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "bigint") return value;
  if (typeof value === "string") return formatString(value);
  return value;
}

// Map DBF row to SQLite row safely
function mapRow(branch: string, row: any) {
  return {
    branch,
    cslipno: sanitizeValue(row.CSLIPNO),
    orddate: sanitizeValue(row.ORDDATE),
    ordtime: formatString(row.ORDTIME),
    cusno: sanitizeValue(row.CUSNO),
    cusname: sanitizeValue(row.CUSNAME),
    cusaddr1: sanitizeValue(row.CUSADDR1),
    cusaddr2: sanitizeValue(row.CUSADDR2),
    custel: sanitizeValue(row.CUSTEL),
    cusfax: sanitizeValue(row.CUSFAX),
    cuscont: sanitizeValue(row.CUSCONT),
    age: toNumber(row.AGE),

    chargpct: toNumber(row.CHARGPCT),
    grschrg: toNumber(row.GRSCHRG),
    promo_pct: toNumber(row.PROMO_PCT),
    promo_amt: toNumber(row.PROMO_AMT),
    sr_tcust: toNumber(row.SR_TCUST),
    sr_body: sanitizeValue(row.SR_BODY),
    sr_disc: toNumber(row.SR_DISC),
    vat: toNumber(row.VAT),
    servchrg: toNumber(row.SERVCHRG),
    othdisc: toNumber(row.OTHDISC),
    udisc: toNumber(row.UDISC),
    bankcharg: toNumber(row.BANKCHARG),
    totchrg: toNumber(row.TOTCHRG),
    pdamt: toNumber(row.PDAMT),
    pmtdisc: toNumber(row.PMTDISC),
    balance: toNumber(row.BALANCE),
    tcash: toNumber(row.TCASH),
    tcharge: toNumber(row.TCHARGE),
    tsigned: toNumber(row.TSIGNED),
    vat_xmpt: toNumber(row.VAT_XMPT),
    ntax_sal: toNumber(row.NTAX_SAL),

    dis_prom: toNumber(row.DIS_PROM),
    dis_udisc: toNumber(row.DIS_UDISC),
    dis_sr: toNumber(row.DIS_SR),
    dis_emp: toNumber(row.DIS_EMP),
    dis_vip: toNumber(row.DIS_VIP),
    dis_gpc: toNumber(row.DIS_GPC),
    dis_pwd: toNumber(row.DIS_PWD),
    dis_g: toNumber(row.DIS_G),
    dis_h: toNumber(row.DIS_H),
    dis_i: toNumber(row.DIS_I),
    dis_j: toNumber(row.DIS_J),
    dis_k: toNumber(row.DIS_K),
    dis_l: toNumber(row.DIS_L),
    dis_vx: toNumber(row.DIS_VX),

    terms: sanitizeValue(row.TERMS),
    cardno: sanitizeValue(row.CARDNO),
    cardtyp: sanitizeValue(row.CARDTYP),
    lastpd: sanitizeValue(row.LASTPD),
    remarks: sanitizeValue(row.REMARKS),
    filler1: sanitizeValue(row.FILLER1),
    filler2: sanitizeValue(row.FILLER2),
  };
}

// Only include PANDA or GRAB from 2026
function isValidRow(row: any) {
  const rawDate = row.ORDDATE;
  const rawName = row.CUSNAME;
  if (!rawDate || !rawName) return false;

  let rowYear: number | null = null;
  if (rawDate instanceof Date) rowYear = rawDate.getFullYear();
  else if (typeof rawDate === "string" && rawDate.length >= 4)
    rowYear = Number(rawDate.substring(0, 4));

  if (rowYear !== year) return false;

  const name = String(rawName).toUpperCase().trim();
  return name === "PANDA" || name === "GRAB";
}

// Find the latest numbered folder (e.g. 01, 02, 03, 04 → returns "04")
function getLatestMonthFolder(branchYearPath: string): string | null {
  if (!fs.existsSync(branchYearPath)) return null;

  const folders = fs
    .readdirSync(branchYearPath)
    .filter((f) => {
      const full = path.join(branchYearPath, f);
      return fs.statSync(full).isDirectory() && /^\d+$/.test(f);
    })
    .sort((a, b) => Number(b) - Number(a)); // descending, highest first

  return folders.length > 0 ? folders[0] : null;
}

// Find the GC zip file inside a folder (e.g. GC013126.ZIP — name may vary)
function findGCZip(monthFolderPath: string): string | null {
  if (!fs.existsSync(monthFolderPath)) return null;

  const file = fs
    .readdirSync(monthFolderPath)
    .find((f) => f.toUpperCase().startsWith("GC") && f.toUpperCase().endsWith(".ZIP"));

  return file ? path.join(monthFolderPath, file) : null;
}

// Process a single branch
async function processBranch(branch: string) {
  const branchYearPath = path.join(rootFolder, branch, String(year));

  const latestMonth = getLatestMonthFolder(branchYearPath);
  if (!latestMonth) {
    console.log(`[Reader][${branch}] No month folders found, skipping.`);
    return;
  }

  const monthFolderPath = path.join(branchYearPath, latestMonth);
  const zipPath = findGCZip(monthFolderPath);
  if (!zipPath) {
    console.log(`[Reader][${branch}] No GC zip found in ${monthFolderPath}, skipping.`);
    return;
  }

  console.log(`[Reader][${branch}] Using latest month: ${latestMonth} → ${zipPath}`);

  const tmpDir = path.join(os.tmpdir(), "pos-import");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  let zip: AdmZip;
  try {
    zip = new AdmZip(zipPath);
  } catch (err) {
    console.error(`[Reader][${branch}] Failed to open ZIP: ${err}`);
    parentPort?.postMessage({ error: "invalid_zip", branch });
    return;
  }

  let branch_name: string | null = null;
  const sysEntry = zip.getEntries().find((e) => e.entryName.toUpperCase() === "SYSINFO.DBF");
  if (sysEntry) {
    const tmpSysPath = path.join(os.tmpdir(), `pos-import`, `${branch}-SYSINFO.DBF`);
    fs.writeFileSync(tmpSysPath, sysEntry.getData(ZIP_PASSWORD));

    const sysDbf = await DBFFile.open(tmpSysPath, { readMode: "loose" });
    const sysRecords = await sysDbf.readRecords(1); // usually only 1 record
    if (sysRecords.length) branch_name = sanitizeValue(sysRecords[0].ADDR1);

    fs.unlinkSync(tmpSysPath);
  }

  const entry = zip.getEntries().find((e) => e.entryName.toUpperCase() === "CHARGES.DBF");
  if (!entry) return;

  const tmpPath = path.join(tmpDir, `${branch}-CHARGES.DBF`);
  fs.writeFileSync(tmpPath, entry.getData(ZIP_PASSWORD));

  const dbf = await DBFFile.open(tmpPath, { readMode: "loose" });
  let batch: any[] = [];
  let records: any[];

  do {
    records = await dbf.readRecords(batchSize);

    for (const row of records) {
      if (!isValidRow(row)) continue;
      batch.push({
        ...mapRow(branch, row),
        branch_name,
      });
    }

    if (batch.length >= batchSize) {
      parentPort?.postMessage({ batch, branch });
      batch = [];
    }
  } while (records.length > 0);

  if (batch.length) parentPort?.postMessage({ batch, branch });

  fs.unlinkSync(tmpPath);
}

// Run all branches in parallel
async function run() {
  console.log(`[Reader] Started at ${new Date().toLocaleString()}`);
  await Promise.all(branches.map((branch) => processBranch(branch)));
  console.log(`[Reader] Finished at ${new Date().toLocaleString()}`);
  parentPort?.postMessage({ done: true });
}

run();
