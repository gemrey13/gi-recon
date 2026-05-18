import { ElectronAPI } from "@electron-toolkit/preload";

type PARTNER = "PANDA" | "GRAB" | "ALL";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      // System Window Controls
      minimize: () => Promise<any>;
      maximize: () => Promise<any>;
      close: () => Promise<any>;
      readConfig: () => Promise<any>;
      saveConfig: (config: any) => Promise<void>;

      importPOSZip: () => Promise<any>;

      // Shared IPC Types
      getBranch: (partner: PARTNER) => Promise<BranchMapping[]>;
      sendSystemLog: (logData: SystemLog) => Promise<void>;

      // Recon IPC Types
      runRecon: (
        partnerType: PARTNER,
        startDate: string,
        endDate?: string,
        branchName?: string,
      ) => Promise<any>;
      saveRecon: (
        partnerType: PARTNER,
        range: IGrabReconRange,
        results: any,
      ) => Promise<{ success: boolean; message: string }>;

      // New Import Manual IPC
      importManual: (type: PARTNER) => Promise<any>;
      importBatch: (type: PARTNER) => Promise<any>;

      // Report IPC Types
      reconSummary: (filters: any) => Promise<any>;
      discrepancy: (filters: any) => Promise<any>;
      unmatched: (filters: any) => Promise<any>;
      partnerSales: (filters: any) => Promise<any>;
      branchPerformance: (filters: any) => Promise<any>;
      systemLogs: (filters: any) => Promise<any>;
    };
  }
}
