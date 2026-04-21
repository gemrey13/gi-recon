type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LogPayload {
  level: LogLevel;
  module: string;
  action: string;
  message: string;
  description: string;
}
