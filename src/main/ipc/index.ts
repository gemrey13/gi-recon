import { ipcMain } from "electron";
import { registerGrabIpc } from "./grabIpc";
import { registerPandaIpc } from "./pandaIpc";
import { registerSystemIpc } from "./systemIpc";
import { registerPosIpc } from "./posIpc";
import { getBranchMapping } from "../services/branchMappingService";
import { registerReconIPC } from "./reconIPC";

export function registerAllIpc() {
  registerPosIpc();
  registerGrabIpc();
  registerSystemIpc();
  registerPandaIpc();
  registerReconIPC();

  ipcMain.handle("get-branches", async (_event, partner: "PANDA" | "GRAB") => {
    return getBranchMapping(partner);
  });
}
