import { parentPort, workerData } from "worker_threads";
import path from "path";
import * as XLSX from "xlsx";
import { pandaMapRow } from "./pandaConstants";

const { files, rootFolder, batchSize } = workerData as {
  files: string[];
  rootFolder: string;
  batchSize: number;
};

async function run() {
  console.log(`[Panda Reader] Started with ${files.length} files`);

  for (const file of files) {
    const fullPath = path.join(rootFolder, file);
    const workbook = XLSX.readFile(fullPath);

    const sheet = workbook.Sheets["Appendix A"];
    if (!sheet) continue;

    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

    let batch: any[] = [];

    for (const row of rows) {
      if (!row["Booking ID"]) continue;

      batch.push(pandaMapRow(row));

      if (batch.length >= batchSize) {
        parentPort?.postMessage({ batch, source: "panda" });
        batch = [];
      }
    }

    if (batch.length) {
      parentPort?.postMessage({ batch, source: "grab" });
    }

    console.log(`[Panda Reader] Finished file ${file}`);
  }

  parentPort?.postMessage({ done: true });
}

run();
