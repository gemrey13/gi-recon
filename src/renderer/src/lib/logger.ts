import { LogPayload } from "@shared/logger";

const send = (payload: LogPayload) => {
  window.api.sendSystemLog(payload);
};

export const logger = {
  info: (module: string, action: string, message: string, description: string) =>
    send({ level: "INFO", module, action, message, description }),

  warn: (module: string, action: string, message: string, description: string) =>
    send({ level: "WARN", module, action, message, description }),

  error: (module: string, action: string, message: string, description: string) =>
    send({ level: "ERROR", module, action, message, description }),
};
