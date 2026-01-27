import fs from "fs";
import crypto from "crypto";
import path from "path";
import parseDBF from "parsedbf";
import { db } from "../db";
import { dialog, BrowserWindow } from "electron";

export async function processPosFile(filePath: string) {
  const win = BrowserWindow.getAllWindows()[0];

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash("md5").update(fileBuffer).digest("hex");

    const alreadyProcessed = db
      .prepare("SELECT 1 FROM processed_files WHERE file_hash = ?")
      .get(fileHash);

    if (alreadyProcessed) {
      console.log(`POS Duplicate: Deleting ${path.basename(filePath)}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return;
    }

    const dataView = new DataView(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);
    const parser = (parseDBF.default || parseDBF) as any;

    if (typeof parser !== "function") {
      throw new Error("DBF Parser initialization failed.");
    }

    const dbfRecords = parser(dataView);

    const rows = dbfRecords.map((r: any) => {
      const out: any = {};
      Object.keys(r).forEach((key) => {
        out[key.trim().toUpperCase()] = r[key];
      });
      return out;
    });

    if (rows.length > 0 && !rows[0].hasOwnProperty("CSLIPNO")) {
      dialog.showMessageBoxSync(win, {
        type: "warning",
        title: "Incorrect File Location",
        message: "This does not look like a POS DBF file.",
        detail: `The file "${path.basename(filePath)}" is missing the 'CSLIPNO' field. If this is a different report, move it to the correct folder. The file will be deleted.`,
        buttons: ["OK"],
      });
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return;
    }

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

        if (row.CSLIPNO) {
          insert.run(
            String(row.CSLIPNO || "").trim(),
            String(row.CUSNO || "").trim(),
            String(row.CUSNAME || "").trim(),
            Number(row.GRSCHRG || 0),
            String(finalDate || ""),
            String(row.ORDTIME || ""),
          );
        }
      }
    });

    insertMany(rows);

    db.prepare(
      "INSERT INTO processed_files (file_hash, file_type, file_name) VALUES (?, ?, ?)",
    ).run(fileHash, "POS", path.basename(filePath));

    const successDir = path.join(path.dirname(filePath), "Processed");
    if (!fs.existsSync(successDir)) fs.mkdirSync(successDir, { recursive: true });

    const destPath = path.join(successDir, path.basename(filePath));
    fs.renameSync(filePath, destPath);

    console.log(`Successfully automated POS import: ${rows.length} rows.`);
  } catch (error) {
    dialog.showMessageBoxSync(win, {
      type: "error",
      title: "POS Processor Error",
      message: "An error occurred while parsing the POS DBF file.",
      detail: String(error),
      buttons: ["OK"],
    });
    
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error("Error in POS Processor:", error);
  }
}
