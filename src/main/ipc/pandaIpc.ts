import { ipcMain, app, dialog } from "electron";
import path from "path";
import fs from "fs";
import { importPandaManual } from "../worker/importPandaManual";

export function registerPandaIpc() {
  ipcMain.handle("panda:importManual", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: "Select Panda Excel file",
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Excel Files", extensions: ["xlsx", "xls"] }],
    });

    if (canceled || filePaths.length === 0) {
      return { totalInserted: 0, message: "No Panda file selected" };
    }

    let totalInserted = 0;
    let messages: string[] = [];

    for (const filePath of filePaths) {
      const tmpFilePath = path.join(
        app.getPath("temp"),
        `panda_${Date.now()}_${path.basename(filePath)}`,
      );
      fs.copyFileSync(filePath, tmpFilePath);

      try {
        const dbPath = path.join(app.getPath("userData"), "pos.db");
        const result = importPandaManual({ dbPath, filePath: tmpFilePath });
        totalInserted += result.inserted;
      } catch (err: any) {
        messages.push(`Error with ${filePath}: ${err.message}`);
      } finally {
        fs.unlink(tmpFilePath, () => {});
      }
    }

    return {
      totalInserted,
      message: "Completed",
    };
  });
}
