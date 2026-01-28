import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getPosData: () => ipcRenderer.invoke('get-initial-pos'),
  // Trigger the matching engine
  runReconciliation: () => ipcRenderer.invoke('run-reconciliation'),
  
  // Fetch the summary counts for the cards
  getReconSummary: () => ipcRenderer.invoke('get-recon-summary'),
  
  // Fetch the list of transactions for the table
  getTransactions: () => ipcRenderer.invoke('get-transactions'),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
