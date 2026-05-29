import fs from "fs";
import path from "path";
import { app } from "electron";
import { BatchImportConfig, PartnerType } from "./types";
import { insertSystemLog } from "./services/logService";

interface AppConfiguration {
  showSidebar: boolean;
  partners: Record<PartnerType, Partial<BatchImportConfig>>;
  pos: { year: number; zipPassword: string; month: number | null };
}

const DEFAULT_CONFIGS: AppConfiguration = {
  showSidebar: true,
  partners: {
    PANDA: {
      rootFolder: "C:\\panda-data",
      sheetName: "Appendix A",
      skipKey: "Order Code (F)",
      xlsxOptions: { cellDates: true },
    },
    GRAB: {
      rootFolder: "C:\\grab-data",
      sheetName: "Transactions",
      skipKey: "Booking ID",
    },
  },
  pos: {
    zipPassword: "admate",
    year: 2026,
    month: 1,
  },
};

const configPath = path.join(app.getPath("userData"), "config.json");

export function readConfig(): AppConfiguration {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIGS, null, 2));

    insertSystemLog({
      level: "INFO",
      module: "OTHER",
      action: "INITIALIZE_CONFIG",
      message: "Configuration file not found. Created default config.json.",
    });

    return DEFAULT_CONFIGS;
  }

  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

export function saveConfig(config: AppConfiguration) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  insertSystemLog({
    level: "INFO",
    module: "OTHER",
    action: "SAVE_CONFIG",
    message: "Application configuration updated successfully.",
    description: `Config saved to ${configPath}`,
  });
}
