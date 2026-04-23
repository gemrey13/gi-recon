import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      // System Window Controls
      minimize: () => Promise<any>;
      maximize: () => Promise<any>;
      close: () => Promise<any>;

      startImportGrab: () => Promise<any>;
      importGrabManual: () => Promise<any>;
      importPOSZip: () => Promise<any>;

      // New IPC for running and saving Grab reconciliation
      runGrabRecon: (startDate: string, endDate?: string, branchName?: string) => Promise<any>;
      saveGrabRecon: (
        range: IGrabReconRange,
        results: any,
      ) => Promise<{ success: boolean; message: string }>;
      getBranch: (partner: "PANDA" | "GRAB") => Promise<BranchMapping[]>;
      sendSystemLog: (logData: SystemLog) => Promise<void>;

      // Panda IPC Types
      startImportPanda: () => Promise<any>;
      importPandaManual: () => Promise<any>;
      runPandaRecon: (startDate: string, endDate?: string, branchName?: string) => Promise<any>;
      savePandaRecon: (
        range: IPandaReconRange,
        results: any,
      ) => Promise<{ success: boolean; message: string }>;
    };
  }
}
