import { PartnerType } from "@shared/recon.types";

export interface XlsxOptions {
  cellDates?: boolean;
}

export interface BatchImportConfig {
  rootFolder: string;
  sheetName: string;
  skipKey: string;
  xlsxOptions?: XlsxOptions;
}

export interface PosConfiguration {
  year: number;
  month: number;
  zipPassword: string;
}

export interface AppConfiguration {
  showSidebar: boolean;
  partners: Record<PartnerType, Partial<BatchImportConfig>>;
  pos: PosConfiguration;
}
