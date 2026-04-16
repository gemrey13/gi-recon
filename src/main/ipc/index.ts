import { ipcMain } from "electron";
import { registerGrabIpc } from "./grabIpc";
import { registerMenuIpc } from "./menuIpc";
import { registerPosIpc } from "./posIpc";
import { registerReconcileIpc } from "./reconcileIpc";
import { getBranchMapping } from "../services/branchMappingService";

export function registerAllIpc() {
  registerPosIpc();
  registerGrabIpc();
  registerReconcileIpc();
  registerMenuIpc();

  ipcMain.handle("get-branches", async (_event, partner: "PANDA" | "GRAB") => {
    return getBranchMapping(partner);
  });
}
