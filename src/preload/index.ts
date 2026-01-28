import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

const api = {
  getPosData: () => ipcRenderer.invoke("get-initial-pos"),

  fetchData: (partner: string, filters: any) =>
    ipcRenderer.invoke("get-partner-data", partner, filters),

  runRecon: (partner: string) => ipcRenderer.invoke("run-recon", partner),

  getReconSummary: () => ipcRenderer.invoke("get-recon-summary"),
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
