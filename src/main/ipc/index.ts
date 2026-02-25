import { registerGrabIpc } from "./grabIpc"
import { registerPosIpc } from "./posIpc"
import { registerReconcileIpc } from "./reconcileIpc"

export function registerAllIpc() {
  registerPosIpc()
  registerGrabIpc()
  registerReconcileIpc()
}
