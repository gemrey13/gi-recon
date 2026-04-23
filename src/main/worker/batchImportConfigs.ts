import { BatchImportConfig, PartnerType } from "../types";

export const BATCH_IMPORT_CONFIGS: Record<PartnerType, BatchImportConfig> = {
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
};
