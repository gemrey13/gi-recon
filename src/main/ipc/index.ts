import { ipcMain } from "electron";
import { registerGrabIpc } from "./grabIpc";
import { registerPandaIpc } from "./pandaIpc";
import { registerSystemIpc } from "./systemIpc";
import { registerPosIpc } from "./posIpc";
import { getBranchMapping } from "../services/branchMappingService";

export function registerAllIpc() {
  registerPosIpc();
  registerGrabIpc();
  registerSystemIpc();
  registerPandaIpc();

  ipcMain.handle("get-branches", async (_event, partner: "PANDA" | "GRAB") => {
    return getBranchMapping(partner);
  });
}
