import { parentPort, workerData } from "worker_threads";
import path from "path";
import * as XLSX from "xlsx";
import { grabMapRow, pandaMapRow } from "../constants";
import { PartnerType } from "../types";

const MAP_ROW = { PANDA: pandaMapRow, GRAB: grabMapRow };

const { files, rootFolder, batchSize, sheetName, skipKey, xlsxOptions, source } = workerData as {
  files: string[];
  rootFolder: string;
  batchSize: number;
  sheetName: string;
  skipKey: string;
  xlsxOptions?: XLSX.ParsingOptions;
  source: PartnerType;
};

async function run() {
  const mapRow = MAP_ROW[source];
  console.log(`[${source} Reader] Started with ${files.length} files`);

  for (const file of files) {
    const fullPath = path.join(rootFolder, file);
    const workbook = XLSX.readFile(fullPath, xlsxOptions);

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { raw: true });

    let batch: any[] = [];

    for (const row of rows) {
      if (!row[skipKey]) continue;

      batch.push(mapRow(row));

      if (batch.length >= batchSize) {
        parentPort?.postMessage({ batch, source });
        batch = [];
      }
    }

    if (batch.length) {
      parentPort?.postMessage({ batch, source });
    }

    console.log(`[${source} Reader] Finished file ${file}`);
  }

  parentPort?.postMessage({ done: true });
}

run();
