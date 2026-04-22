import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { SystemLog } from "../main/services/logService";

const api = {
  // System Window Controls
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),

  startImportGrab: () => ipcRenderer.invoke("start-import-grab"),
  importGrabManual: () => ipcRenderer.invoke("grab:importManual"),
  importPOSZip: () => ipcRenderer.invoke("POS:importZip"),

  // New IPC for running and saving Grab reconciliation
  runGrabRecon: (startDate: string, endDate?: string, branchName?: string) =>
    ipcRenderer.invoke("run-grab-recon", startDate, endDate, branchName),

  saveGrabRecon: (range: { startDate: string; endDate: string; branch: string }, results: any) =>
    ipcRenderer.invoke("save-grab-recon", range, results),

  getBranch: (partner: "PANDA" | "GRAB") => ipcRenderer.invoke("get-branches", partner),

  sendSystemLog: (logData: SystemLog) => ipcRenderer.invoke("write-log", logData),

  // Panda IPC
  importPandaManual: () => ipcRenderer.invoke("panda:importManual"),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
