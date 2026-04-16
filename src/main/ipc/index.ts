import { ipcMain } from "electron";
import { registerGrabIpc } from "./grabIpc";
import { registerSystemIpc } from "./systemIpc";
import { registerPosIpc } from "./posIpc";
import { registerReconcileIpc } from "./reconcileIpc";
import { getBranchMapping } from "../services/branchMappingService";

export function registerAllIpc() {
  registerPosIpc();
  registerGrabIpc();
  registerReconcileIpc();
  registerSystemIpc();

  ipcMain.handle("get-branches", async (_event, partner: "PANDA" | "GRAB") => {
    return getBranchMapping(partner);
  });
}
