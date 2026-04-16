import { getDb } from "../utils";

const databasePath = getDb();

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export type LogModule =
  | "UI"
  | "MAIN"
  | "DATABASE"
  | "GRAB_SERVICE"
  | "AUTH"
  | "PANDA_SERVICE"
  | "EXPORT_SERVICE"
  | "IMPORT_SERVICE"
  | "OTHER";

export type LogAction =
  | "APP_START"
  | "APP_QUIT"
  | "PAGE_VIEW"
  | "CLICK"
  | "DB_QUERY"
  | "RECON_RUN"
  | "RECON_SAVE"
  | "API_ERROR";

export interface SystemLog {
  id?: number;
  timestamp?: string;
  level: LogLevel;
  module: LogModule;
  action: string;
  message: string;
  description?: string;
  user_name?: string;
}

/**
 * Global logging function to track application activity
 */
export const insertSystemLog = (log: Omit<SystemLog, 'id' | 'timestamp'>) => {
  try {
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
      log.user_name || 'System'
    );
  } catch (error) {
    // If the database is locked, we fallback to console so the error isn't lost
    console.error("Critical: Failed to write to system_logs", error);
  }
};