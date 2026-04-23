import { ipcMain, app, dialog } from "electron";
import path from "path";
import fs from "fs";
import os from "os";
import createPandaWorkerReader from "../worker/panda/pandaReaderWorker?nodeWorker";
import createPandaWorkerWriter from "../worker/panda/pandaWriterWorker?nodeWorker";
import { importPandaManual } from "../worker/panda/importPandaManual";

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

  ipcMain.handle("start-import-panda", async () => {
    const startTime = new Date();
    console.log(`[Main][Panda] Import started at ${startTime.toLocaleString()}`);

    const rootFolder = "C:\\panda-data";
    const dbPath = path.join(app.getPath("userData"), "pos.db");

    const allFiles = fs
      .readdirSync(rootFolder)
      .filter((f) => f.endsWith(".xlsx") || f.endsWith(".xls"));

    const numReaders = os.cpus().length;
    console.log(`[Main][Panda] Using ${numReaders} reader workers`);
    const batchSize = 1000;

    const readerGroups: string[][] = Array.from({ length: numReaders }, () => []);
    allFiles.forEach((file, i) => readerGroups[i % numReaders].push(file));

    const writerWorker = createPandaWorkerWriter({ workerData: { dbPath } });
    const writerPromise = new Promise<number>((resolve) => {
      writerWorker.on("message", (msg) => {
        if ("totalInserted" in msg) resolve(msg.totalInserted);
      });
    });

    const readerPromises = readerGroups.map((group) => {
      const reader = createPandaWorkerReader({
        workerData: { files: group, rootFolder, batchSize },
      });
      reader.on("message", (msg) => writerWorker.postMessage(msg));
      return new Promise<void>((resolve) => reader.on("exit", () => resolve()));
    });

    await Promise.all(readerPromises);
    writerWorker.postMessage({ done: true });

    const totalInserted = await writerPromise;

    const endTime = new Date();
    console.log(`[Main][Panda] Finished at ${endTime.toLocaleString()}`);
    console.log(`[Main][Panda] Total time: ${(endTime.getTime() - startTime.getTime()) / 1000}s`);
    console.log(`[Main][Panda] Total inserted: ${totalInserted}`);
    const totalTime = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2);
    return { message: `Added Panda file in ${totalTime}s` };
  });
}
