import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { DBFFile } from "dbffile";
import os from "os";
import { formatString, toNumber, toSqliteDateTime } from "../utils";

const { branches, rootFolder, batchSize } = workerData as {
  branches: string[];
  rootFolder: string;
  batchSize: number;
};

const ZIP_PASSWORD = "admate";

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
    ordtime: sanitizeValue(row.ORDTIME),
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

  let year: number | null = null;
  if (rawDate instanceof Date) year = rawDate.getFullYear();
  else if (typeof rawDate === "string" && rawDate.length >= 4)
    year = Number(rawDate.substring(0, 4));
  if (year !== 2026) return false;

  const name = String(rawName).toUpperCase().trim();
  return name === "PANDA" || name === "GRAB";
}

// Process a single branch
async function processBranch(branch: string) {
  const zipPath = path.join(rootFolder, branch, "2026", "01", "GC013126.ZIP");
  if (!fs.existsSync(zipPath)) return;

  const tmpDir = path.join(os.tmpdir(), "pos-import");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const zip = new AdmZip(zipPath);

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
        branch_name, // add the branch_name from SYSINFO
      });
    }

    if (batch.length >= batchSize) {
      parentPort?.postMessage({ batch, branch });
      batch = [];
    }
  } while (records.length > 0);

  if (batch.length) parentPort?.postMessage({ batch, branch });

  // Clean up temp file
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
