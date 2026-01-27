import fs from "fs";
import crypto from "crypto";
import path from "path";
import * as XLSX from "xlsx";
import { db } from "../db";
import { dialog, BrowserWindow } from "electron";

export async function processGrabFile(filePath: string) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash("md5").update(fileBuffer).digest("hex");

    const alreadyProcessed = db
      .prepare("SELECT 1 FROM processed_files WHERE file_hash = ?")
      .get(fileHash);

    if (alreadyProcessed) {
      console.log(`Grab Duplicate: Deleting ${path.basename(filePath)}`);
      fs.unlinkSync(filePath);
      return;
    }
    const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
    const targetSheetName = "Transactions";

    if (!workbook.SheetNames.includes(targetSheetName)) {
      const win = BrowserWindow.getAllWindows()[0];
      dialog.showMessageBoxSync(win, {
        type: "warning",
        title: "Wrong File Format",
        message: "Sheet 'Transactions' not found.",
        detail: `The file "${path.basename(filePath)}" is missing the required Grab sheet. Did you put a FoodPanda or POS file in the Grab folder?`,
        buttons: ["OK"],
      });
      return;
    }

    const worksheet = workbook.Sheets[targetSheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (rawData.length > 0 && !rawData[0]["Booking ID"]) {
      const win = BrowserWindow.getAllWindows()[0];
      dialog.showMessageBoxSync(win, {
        type: "warning",
        title: "Incorrect Column Headers",
        message: "This does not look like a Grab transaction file.",
        detail:
          "Required column 'Booking ID' was not found. Please move this file to the correct import folder.",
        buttons: ["OK"],
      });
      return;
    }

    const insert = db.prepare(`
      INSERT INTO grab_transactions (store_name, updated_on, booking_id, amount, category)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(booking_id) DO NOTHING
    `);

    const insertMany = db.transaction((data) => {
      for (const row of data) {
        const bookingId = row["Booking ID"];
        if (!bookingId) continue;

        let finalDate = "";
        const rawDate = row["Updated On"];
        if (rawDate instanceof Date) {
          finalDate = `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, "0")}-${String(rawDate.getDate()).padStart(2, "0")}`;
        } else if (!isNaN(Number(rawDate)) && rawDate !== "") {
          const d = new Date((Number(rawDate) - 25569) * 86400 * 1000);
          finalDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        } else {
          finalDate = String(rawDate || "");
        }

        insert.run(
          String(row["Store Name"] || ""),
          finalDate,
          String(bookingId).trim(),
          Number(row["Amount"] || 0),
          String(row["Category"] || ""),
        );
      }
    });

    insertMany(rawData);

    db.prepare(
      "INSERT INTO processed_files (file_hash, file_type, file_name) VALUES (?, ?, ?)",
    ).run(fileHash, "GRAB", path.basename(filePath));

    const successDir = path.join(path.dirname(filePath), "Processed");
    if (!fs.existsSync(successDir)) fs.mkdirSync(successDir, { recursive: true });
    fs.renameSync(filePath, path.join(successDir, path.basename(filePath)));

    console.log(`Successfully imported Grab: ${rawData.length} rows.`);
  } catch (error) {
    const win = BrowserWindow.getAllWindows()[0];
    dialog.showMessageBoxSync(win, {
      type: "error",
      title: "Grab Processor Error",
      message: "An error occurred while processing the Grab file.",
      detail: String(error),
      buttons: ["OK"],
    });

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error("Error in Grab Processor:", error);
  }
}
