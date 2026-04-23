import { ipcMain } from "electron";
import { registerSystemIpc } from "./systemIpc";
import { registerPosIpc } from "./posIpc";
import { getBranchMapping } from "../services/branchMappingService";
import { registerReconIPC } from "./reconIPC";
import { registerIngestDataIPC } from "./ingestDataIPC";

export function registerAllIpc() {
  registerPosIpc();
  registerSystemIpc();
  registerReconIPC();
  registerIngestDataIPC();

  ipcMain.handle("get-branches", async (_event, partner: "PANDA" | "GRAB") => {
    return getBranchMapping(partner);
  });
}
