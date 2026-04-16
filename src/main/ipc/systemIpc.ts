import { app, BrowserWindow, ipcMain } from "electron";
import { insertSystemLog } from "../services/logService";

export function registerSystemIpc() {
  ipcMain.on("window-minimize", (_) => {
    const win = BrowserWindow.getFocusedWindow();
    win?.minimize();
  });

  ipcMain.on("window-maximize", (_) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
  });

  ipcMain.on("window-close", (_) => {
    insertSystemLog({
      level: "INFO",
      module: "MAIN",
      action: "APP_CLOSE", // Changed from APP_START
      message: "User closed the application window", // Changed message
      description: `Session ended. Version: ${app.getVersion()}`,
    });
    const win = BrowserWindow.getFocusedWindow();
    win?.close();
  });

  ipcMain.handle("write-log", async (_, logData) => {
    insertSystemLog(logData);
  });
}
