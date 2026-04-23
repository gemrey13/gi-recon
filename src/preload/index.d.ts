import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      // System Window Controls
      minimize: () => Promise<any>;
      maximize: () => Promise<any>;
      close: () => Promise<any>;

      // GRAB IPC Types
      startImportGrab: () => Promise<any>;
      importGrabManual: () => Promise<any>;
      importPOSZip: () => Promise<any>;

      // PANDA IPC Types
      startImportPanda: () => Promise<any>;
      importPandaManual: () => Promise<any>;

      // Shared IPC Types
      getBranch: (partner: "PANDA" | "GRAB") => Promise<BranchMapping[]>;
      sendSystemLog: (logData: SystemLog) => Promise<void>;

      // Recon IPC Types
      runRecon: (
        partnerType: "PANDA" | "GRAB",
        startDate: string,
        endDate?: string,
        branchName?: string,
      ) => Promise<any>;
      saveRecon: (
        partnerType: "PANDA" | "GRAB",
        range: IGrabReconRange,
        results: any,
      ) => Promise<{ success: boolean; message: string }>;
    };
  }
}
