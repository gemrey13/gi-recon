import { ipcMain } from "electron";
import { runReconciliation, saveReconciliationResults } from "../services/reconService";

export function registerReconIPC() {
  ipcMain.handle("run-recon", async (_event, partnerType, startDate, endDate, branchName) => {
    return runReconciliation(partnerType, startDate, endDate, branchName);
  });

  ipcMain.handle("save-recon", async (_event, partnerType, range, results) => {
    return saveReconciliationResults(partnerType, range, results);
  });
}
