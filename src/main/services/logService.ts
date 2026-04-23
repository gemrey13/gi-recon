import { SystemLog } from "../types";
import { getDb } from "../utils";

export const insertSystemLog = (log: Omit<SystemLog, "id" | "timestamp">) => {
  try {
    const databasePath = getDb();

    const stmt = databasePath.prepare(`
      INSERT INTO system_logs (level, module, action, message, description, user_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      log.level,
      log.module,
      log.action,
      log.message,
      log.description || null,
      log.user_name || "System",
    );
  } catch (error) {
    console.error("Critical: Failed to write to system_logs", error);
  }
};
