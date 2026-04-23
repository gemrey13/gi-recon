import { ElectronAPI } from "@electron-toolkit/preload";

type PARTNER = "PANDA" | "GRAB";


declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      // System Window Controls
      minimize: () => Promise<any>;
      maximize: () => Promise<any>;
      close: () => Promise<any>;

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
    };
  }
}
