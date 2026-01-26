import fs from "fs";
import crypto from "crypto";
import path from "path";
const parseDBF = require("parsedbf");
import { db } from "../db";

export async function processPosFile(filePath: string) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash("md5").update(fileBuffer).digest("hex");

    const alreadyProcessed = db
      .prepare("SELECT 1 FROM processed_files WHERE file_hash = ?")
      .get(fileHash);
    if (alreadyProcessed) return;

    const dataView = new DataView(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);

    const parser = (parseDBF.default || parseDBF) as any;
    if (typeof parser !== "function") {
      throw new Error("DBF Parser initialization failed. parseDBF is not a function.");
    }

    const dbfRecords = parser(dataView);

    const rows = dbfRecords.map((r: any) => {
      const out: any = {};
      Object.keys(r).forEach((key) => {
        out[key.trim().toUpperCase()] = r[key];
      });
      return out;
    });

    const insert = db.prepare(`
        INSERT INTO pos_transactions (cslipno, cusno, cusname, gross_amount, order_date, order_time)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(cslipno, order_date, gross_amount) DO NOTHING
      `);

    const insertMany = db.transaction((data) => {
      for (const row of data) {
        let finalDate = row.ORDDATE;
        if (row.ORDDATE instanceof Date) {
          const year = row.ORDDATE.getFullYear();
          const month = String(row.ORDDATE.getMonth() + 1).padStart(2, "0");
          const day = String(row.ORDDATE.getDate()).padStart(2, "0");
          finalDate = `${year}-${month}-${day}`;
        }

        insert.run(
          String(row.CSLIPNO || ""),
          String(row.CUSNO || ""),
          String(row.CUSNAME || ""), 
          Number(row.GRSCHRG || 0),
          String(finalDate || ""),
          String(row.ORDTIME || ""),
        );
      }
    });

    insertMany(rows);

    db.prepare(
      "INSERT INTO processed_files (file_hash, file_type, file_name) VALUES (?, ?, ?)",
    ).run(fileHash, "POS", path.basename(filePath));

    const successDir = path.join(path.dirname(filePath), "Processed");
    if (!fs.existsSync(successDir)) fs.mkdirSync(successDir, { recursive: true });
    fs.renameSync(filePath, path.join(successDir, path.basename(filePath)));

    console.log(`Successfully automated import: ${rows.length} rows.`);
  } catch (error) {
    console.error("Error in POS Processor:", error);
  }
}
