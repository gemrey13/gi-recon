import { ipcMain } from "electron";
import { registerSystemIpc } from "./systemIpc";
import { registerPosIpc } from "./posIpc";
import { getBranchMapping } from "../services/branchMappingService";
import { registerReconIPC } from "./reconIPC";
import { registerIngestDataIPC } from "./ingestDataIPC";
import { PartnerType } from "../types";

export function registerAllIpc() {
  registerPosIpc();
  registerSystemIpc();
  registerReconIPC();
  registerIngestDataIPC();

  ipcMain.handle("get-branches", async (_event, partner: PartnerType) => {
    return getBranchMapping(partner);
  });
}
