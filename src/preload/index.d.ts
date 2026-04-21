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

      reconGrabPos: (filters?: any) => Promise<any>;
      getGrabBranches: () => Promise<string[]>;

      // New IPC for running and saving Grab reconciliation
      runGrabRecon: (startDate: string, endDate?: string, branchName?: string) => Promise<any>;
      saveGrabRecon: (
        range: IGrabReconRange,
        results: any,
      ) => Promise<{ success: boolean; message: string }>;
      getBranch: (partner: "PANDA" | "GRAB") => Promise<BranchMapping[]>;
      sendSystemLog: (logData: SystemLog) => Promise<void>;
    };
  }
}
