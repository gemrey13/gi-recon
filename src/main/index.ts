import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import chokidar from "chokidar";
import fs from "fs";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import db, { initDb } from "./db";
import { processPosFile } from "./utils/posProcessor";


// --- Automation Setup ---
function initAutomation(): void {
  const baseDir = join(app.getPath("documents"), "Gi-Recon");
  const posDir = join(baseDir, "POS_Imports");
  const successDir = join(posDir, "Processed");

  // Ensure folders exist
  [baseDir, posDir, successDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Start watching for POS DBF files
  const watcher = chokidar.watch(posDir, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    depth: 0, // Don't watch the 'Processed' subfolder
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });

  watcher.on("add", (filePath) => {
    if (filePath.toLowerCase().endsWith(".dbf")) {
      console.log(`Automation: Found new POS file at ${filePath}`);
      processPosFile(filePath);
    }
  });
}




function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.giligans.girecon");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("ping", () => console.log("pong"));

  ipcMain.handle('get-initial-pos', async () => {
    try {
      // Query the first 10 records
      return db.prepare('SELECT * FROM pos_transactions LIMIT 10').all();
    } catch (error) {
      console.error("Failed to fetch POS data:", error);
      return [];
    }
  });

  initDb();
  initAutomation();
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
