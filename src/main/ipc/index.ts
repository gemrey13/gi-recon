import { registerGrabIpc } from "./grabIpc"
import { registerMenuIpc } from "./menuIpc"
import { registerPosIpc } from "./posIpc"
import { registerReconcileIpc } from "./reconcileIpc"

export function registerAllIpc() {
  registerPosIpc()
  registerGrabIpc()
  registerReconcileIpc()
  registerMenuIpc()
}
