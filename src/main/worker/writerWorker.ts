import { parentPort, workerData } from "worker_threads";
import Database from "better-sqlite3";
import { grabInsertStatement, pandaInsertStatement } from "../constants";
import { PartnerType } from "../types";

const INSERT_STATEMENTS = { PANDA: pandaInsertStatement, GRAB: grabInsertStatement };

const { dbPath, source } = workerData as {
  dbPath: string;
  source: PartnerType;
};

const db = new Database(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = OFF;
  PRAGMA cache_size = -100000;
  PRAGMA temp_store = MEMORY;
`);

const insertStmt = db.prepare(INSERT_STATEMENTS[source]);
let totalInserted = 0;

parentPort?.on("message", (msg: { batch?: any[]; done?: boolean }) => {
  if (msg.batch?.length) {
    try {
      const transaction = db.transaction((rows: any[]) => {
        for (const row of rows) insertStmt.run(row);
      });
      transaction(msg.batch);

      totalInserted += msg.batch.length;
      console.log(
        `[${source} Writer] Inserted batch of ${msg.batch.length}, total: ${totalInserted}`,
      );
    } catch (err: any) {
      console.error(`[${source} Writer] Error inserting batch:`, err);
      parentPort?.postMessage({ error: err.message });
    }
  }

  if (msg.done) {
    console.log(`[${source} Writer] All done. Total inserted: ${totalInserted}`);
    parentPort?.postMessage({ totalInserted });
  }
});
