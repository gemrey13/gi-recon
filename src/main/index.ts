import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import db, { initDb } from "./db";
import { applyMatches, createSession, updateSessionSummary } from "./db/sessions";
import { insertGrabTransactions, insertPOSTransactions } from "./db/insert";
import { reconcilePOSvsGrab } from "./db/match";
import { getBranchNameFromGrab } from "./db/branch";
import path from "path";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    maximizable: true,
    icon: path.join(__dirname, "../../resources/ico.ico"),
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow!.maximize();
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

  ipcMain.handle("recon:start", async (_, payload) => {
    const { partner, posRows, grabRows } = payload;

    const branchName = getBranchNameFromGrab(grabRows);

    let createdOn = grabRows[0].created_on;
    if (!createdOn) throw new Error("Created On column missing in Grab file");

    // Start a transaction
    const tx = db.transaction(() => {
      // Create session first
      const sessionId = createSession(db, {
        partner,
        branch_name: branchName,
        start_date: createdOn,
        end_date: createdOn,
      });

      // Insert POS & Grab transactions
      const posErrors = insertPOSTransactions(db, sessionId, posRows);
      const grabErrors = insertGrabTransactions(db, sessionId, grabRows);

      // If any insert failed, throw to rollback session creation
      if (posErrors || grabErrors) {
        throw { posErrors, grabErrors };
      }

      return sessionId;
    });

    try {
      const sessionId = tx();
      // Continue reconciliation only if inserts succeeded
      const pos = db.prepare(`SELECT * FROM pos_transactions WHERE session_id = ?`).all(sessionId);
      const grab = db
        .prepare(`SELECT * FROM grab_transactions WHERE session_id = ?`)
        .all(sessionId);

      const results = reconcilePOSvsGrab(pos, grab);

      applyMatches(db, results);
      updateSessionSummary(db, sessionId);

      return { sessionId };
    } catch (err) {
      // Return error info instead of throwing
      return { errors: err };
    }
  });

  initDb();
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
