import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { SystemLog } from "../main/services/logService";

const api = {
  // System Window Controls
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),

  // GRAB IPC
  startImportGrab: () => ipcRenderer.invoke("start-import-grab"),
  importGrabManual: () => ipcRenderer.invoke("grab:importManual"),
  importPOSZip: () => ipcRenderer.invoke("POS:importZip"),

  // Panda IPC
  startImportPanda: () => ipcRenderer.invoke("start-import-panda"),
  importPandaManual: () => ipcRenderer.invoke("panda:importManual"),

  // Shared IPC
  getBranch: (partner: "PANDA" | "GRAB") => ipcRenderer.invoke("get-branches", partner),
  sendSystemLog: (logData: SystemLog) => ipcRenderer.invoke("write-log", logData),

  // Recon IPC
  runRecon: (
    partnerType: "PANDA" | "GRAB",
    startDate: string,
    endDate?: string,
    branchName?: string,
  ) => ipcRenderer.invoke("run-recon", partnerType, startDate, endDate, branchName),
  saveRecon: (
    partnerType: "PANDA" | "GRAB",
    range: { startDate: string; endDate: string; branch: string },
    results: any,
  ) => ipcRenderer.invoke("save-recon", partnerType, range, results),
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
