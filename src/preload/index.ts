import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { SystemLog } from "../main/types";

type PARTNER = "PANDA" | "GRAB";

export interface ReportFilters {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  branch?: string; // pos_code
  partnerType?: "GRAB" | "PANDA" | "ALL";
}

const api = {
  // System Window Controls
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  readConfig: () => ipcRenderer.invoke("config:read"),
  saveConfig: (config: any) => ipcRenderer.invoke("config:save", config),

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

  // Import IPC
  importManual: (type: PARTNER) => ipcRenderer.invoke("import:manual", type),
  importBatch: (type: PARTNER) => ipcRenderer.invoke("import:batch", type),
  importPOSZip: () => ipcRenderer.invoke("POS:importZip"),

  // Report IPC
  reconSummary: (filters: ReportFilters) => ipcRenderer.invoke("report:reconSummary", filters),
  discrepancy: (filters: ReportFilters) => ipcRenderer.invoke("report:discrepancy", filters),
  unmatched: (filters: ReportFilters) => ipcRenderer.invoke("report:unmatched", filters),
  partnerSales: (filters: ReportFilters) => ipcRenderer.invoke("report:partnerSales", filters),
  branchPerformance: (filters: ReportFilters) =>
    ipcRenderer.invoke("report:branchPerformance", filters),
  systemLogs: (
    filters: {
      dateFrom?: string;
      dateTo?: string;
      level?: string;
      module?: string;
      limit?: number;
    } = {},
  ) => ipcRenderer.invoke("report:systemLogs", filters),
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
