import { ipcMain, app, dialog } from "electron";
import path from "path";
import fs from "fs";
import { importManual } from "../services/ingestDataService";

export function registerIngestDataIPC() {
  ipcMain.handle("import:manual", async (_event, type: "PANDA" | "GRAB") => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: `Select ${type} Excel file`,
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Excel Files", extensions: ["xlsx", "xls"] }],
    });

    if (canceled || filePaths.length === 0) {
      return { totalInserted: 0, message: "No file selected" };
    }

    let totalInserted = 0;
    const messages: string[] = [];

    for (const filePath of filePaths) {
      const tmpFilePath = path.join(
        app.getPath("temp"),
        `${type}_${Date.now()}_${path.basename(filePath)}`,
      );
      fs.copyFileSync(filePath, tmpFilePath);

      try {
        const dbPath = path.join(app.getPath("userData"), "pos.db");
        const result = importManual({ dbPath, filePath: tmpFilePath, type });
        totalInserted += result.inserted;
      } catch (err: any) {
        messages.push(`Error with ${filePath}: ${err.message}`);
      } finally {
        fs.unlink(tmpFilePath, () => {});
      }
    }

    return { totalInserted, message: messages.length ? messages.join("; ") : "Completed" };
  });
}
