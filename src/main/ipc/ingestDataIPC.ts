import { ipcMain, app, dialog } from "electron";
import path from "path";
import fs from "fs";
import { importManual } from "../services/ingestDataService";

import os from "os";
import createReaderWorker from "../worker/readerWorker?nodeWorker";
import createWriterWorker from "../worker/writerWorker?nodeWorker";
import { PartnerType } from "../types";
import { readConfig } from "../config";

export function registerIngestDataIPC() {
  ipcMain.handle("import:manual", async (_event, type: PartnerType) => {
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
        const result = importManual({ filePath: tmpFilePath, type });
        totalInserted += result.inserted;
      } catch (err: any) {
        messages.push(`Error with ${filePath}: ${err.message}`);
      } finally {
        fs.unlink(tmpFilePath, () => {});
      }
    }

    return { totalInserted, message: messages.length ? messages.join("; ") : "Completed" };
  });

  function getPartnerConfig(type: PartnerType) {
    const config = readConfig().partners[type];

    if (!config) throw new Error(`No config for ${type}`);

    return config;
  }

  ipcMain.handle("import:batch", async (_event, type: PartnerType) => {
    const config = getPartnerConfig(type);
    if (!config) throw new Error(`Unknown import type: ${type}`);

    const startTime = new Date();
    console.log(`[Main][${type}] Import started at ${startTime.toLocaleString()}`);

    const dbPath = path.join(app.getPath("userData"), "pos.db");

    const allFiles = fs
      .readdirSync(config.rootFolder!)
      .filter((f) => f.endsWith(".xlsx") || f.endsWith(".xls"));

    const numReaders = os.cpus().length;
    const batchSize = 1000;

    console.log(`[Main][${type}] Using ${numReaders} reader workers for ${allFiles.length} files`);

    const readerGroups: string[][] = Array.from({ length: numReaders }, () => []);
    allFiles.forEach((file, i) => readerGroups[i % numReaders].push(file));

    const writerWorker = createWriterWorker({
      workerData: { dbPath, source: type },
    });

    const writerPromise = new Promise<number>((resolve, reject) => {
      writerWorker.on("message", (msg) => {
        if ("totalInserted" in msg) resolve(msg.totalInserted);
        if ("error" in msg) reject(new Error(msg.error));
      });
    });

    const readerPromises = readerGroups.map((group) => {
      const reader = createReaderWorker({
        workerData: {
          files: group,
          rootFolder: config.rootFolder,
          batchSize,
          sheetName: config.sheetName,
          skipKey: config.skipKey,
          xlsxOptions: config.xlsxOptions,
          source: type,
        },
      });
      reader.on("message", (msg) => writerWorker.postMessage(msg));
      return new Promise<void>((resolve) => reader.on("exit", () => resolve()));
    });

    await Promise.all(readerPromises);
    writerWorker.postMessage({ done: true });

    const totalInserted = await writerPromise;

    const endTime = new Date();
    const totalTime = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2);

    console.log(`[Main][${type}] Finished at ${endTime.toLocaleString()}`);
    console.log(`[Main][${type}] Total time: ${totalTime}s — Total inserted: ${totalInserted}`);

    return { message: `Added ${type} data in ${totalTime}s` };
  });
}
