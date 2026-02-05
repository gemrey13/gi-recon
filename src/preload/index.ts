import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

const api = {
  startRecon: (payload: any) => ipcRenderer.invoke("recon:start", payload),
  fetchSession: (filters: any) => ipcRenderer.invoke("session:fetch", filters),
  fetchTransactions: (sessionId: number) => ipcRenderer.invoke("transactions:fetch", sessionId),

  getPosPath: () => ipcRenderer.invoke("get-pos-path"),
  selectPosPath: () => ipcRenderer.invoke("select-pos-path"),
  openPosPath: () => ipcRenderer.invoke("open-pos-path"),
  getBranches: () => ipcRenderer.invoke("get-branches"),

  readPOSBranches: () => ipcRenderer.invoke("read-pos-charges"),
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
