import { BrowserWindow, ipcMain } from "electron";

export function registerMenuIpc() {
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
    const win = BrowserWindow.getFocusedWindow();
    win?.close();
  });
}
