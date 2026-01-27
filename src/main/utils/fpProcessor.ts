import fs from "fs";
import crypto from "crypto";
import path from "path";
import * as XLSX from "xlsx";
import { db } from "../db";

export async function processFoodPandaFile(filePath: string) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash("md5").update(fileBuffer).digest("hex");

    // Check if already processed
    const alreadyProcessed = db
      .prepare("SELECT 1 FROM processed_files WHERE file_hash = ?")
      .get(fileHash);
    if (alreadyProcessed) return;

    // 1. Force the library to read dates as strings in YYYY-MM-DD format
    const workbook = XLSX.read(fileBuffer, {
      type: "buffer",
      cellDates: false, // Don't convert to JS Date objects automatically
      raw: false, // Use the formatted text from the cell
      dateNF: "yyyy-mm-dd", // Tell Excel to format dates this way
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 2. Use defval to ensure empty cells don't break the mapping
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    const insert = db.prepare(`
      INSERT INTO foodpanda_transactions (order_code, gross_amount, order_date, partner_name)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(order_code) DO NOTHING
    `);

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        const orderCode = row["Order Code (F)"];
        let val = row["Order Date (H)"];
        let finalDate = "";

        if (val instanceof Date) {
          // 1. Handle actual Date Objects
          const y = val.getFullYear();
          const m = String(val.getMonth() + 1).padStart(2, "0");
          const d = String(val.getDate()).padStart(2, "0");
          finalDate = `${y}-${m}-${d}`;
        } else if (!isNaN(Number(val)) && typeof val !== "boolean" && String(val).trim() !== "") {
          // 2. Handle Excel Serial Numbers (e.g., 46038)
          // Excel dates start from Jan 1, 1900. JS dates start from Jan 1, 1970.
          const date = new Date((Number(val) - 25569) * 86400 * 1000);
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          finalDate = `${y}-${m}-${d}`;
        } else {
          // 3. Handle Strings (e.g., "1/17/2026")
          finalDate = String(val || "").trim();
          if (finalDate.includes("/")) {
            const parts = finalDate.split("/");
            if (parts.length === 3) {
              const [m, d, y] = parts;
              finalDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
            }
          }
        }

        if (orderCode) {
          insert.run(
            String(orderCode).trim(),
            Number(row["Gross Food Value / Product Value By Customer (J)"] || 0),
            finalDate,
            String(row["Partner Name (D)"] || ""),
          );
        }
      }
    });
    insertMany(rawData);

    // 6. Record File in Processed History
    db.prepare(
      "INSERT INTO processed_files (file_hash, file_type, file_name) VALUES (?, ?, ?)",
    ).run(fileHash, "PANDA", path.basename(filePath));

    // 7. Move File to 'Processed' folder
    const successDir = path.join(path.dirname(filePath), "Processed");
    if (!fs.existsSync(successDir)) fs.mkdirSync(successDir, { recursive: true });

    const destPath = path.join(successDir, path.basename(filePath));
    fs.renameSync(filePath, destPath);

    console.log(`Successfully automated PANDA import: ${rawData.length} rows.`);
  } catch (error) {
    console.error("Error in FoodPanda Processor:", error);
  }
}
