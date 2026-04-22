import { parentPort, workerData } from "worker_threads";
import Database from "better-sqlite3";
import { grabInsertStatement } from "./grabConstans";

const { dbPath } = workerData as { dbPath: string };
const db = new Database(dbPath);

// WAL and performance settings
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = OFF;
  PRAGMA cache_size = -100000;
  PRAGMA temp_store = MEMORY;
`);

const insertStmt = db.prepare(grabInsertStatement);

let totalInserted = 0;

parentPort?.on("message", (msg: { batch?: any[]; done?: boolean }) => {
  if (msg.batch && msg.batch.length) {
    try {
      const transaction = db.transaction((rows: any[]) => {
        for (const row of rows) insertStmt.run(row);
      });
      transaction(msg.batch);

      totalInserted += msg.batch.length;
      console.log(`[Grab Writer] Inserted batch of ${msg.batch.length}, total: ${totalInserted}`);
    } catch (err: any) {
      console.error("[Grab Writer] Error inserting batch:", err);
      parentPort?.postMessage({ error: err.message });
    }
  }

  if (msg.done) {
    console.log(`[Grab Writer] All done. Total inserted: ${totalInserted}`);
    parentPort?.postMessage({ totalInserted });
  }
});
