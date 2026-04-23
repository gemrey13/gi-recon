import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { SystemLog } from "../main/types";

type PARTNER = "PANDA" | "GRAB";

const api = {
  // System Window Controls
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),

  importPOSZip: () => ipcRenderer.invoke("POS:importZip"),

  // Shared IPC
  getBranch: (partner: PARTNER) => ipcRenderer.invoke("get-branches", partner),
  sendSystemLog: (logData: SystemLog) => ipcRenderer.invoke("write-log", logData),

  // Recon IPC
  runRecon: (partnerType: PARTNER, startDate: string, endDate?: string, branchName?: string) =>
    ipcRenderer.invoke("run-recon", partnerType, startDate, endDate, branchName),
  saveRecon: (
    partnerType: PARTNER,
    range: { startDate: string; endDate: string; branch: string },
    results: any,
  ) => ipcRenderer.invoke("save-recon", partnerType, range, results),

  // New Import Manual IPC
  importManual: (type: PARTNER) => ipcRenderer.invoke("import:manual", type),
  importBatch: (type: PARTNER) => ipcRenderer.invoke("import:batch", type),
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
