import fs from "fs";
import path from "path";
import { app } from "electron";
import { BatchImportConfig, PartnerType } from "./types";

interface AppConfiguration {
  showSidebar: boolean;
  partners: Record<PartnerType, Partial<BatchImportConfig>>;
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
};

const configPath = path.join(app.getPath("userData"), "config.json");

export function readConfig(): AppConfiguration {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIGS, null, 2));
    return DEFAULT_CONFIGS;
  }

  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

export function saveConfig(config: AppConfiguration) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
