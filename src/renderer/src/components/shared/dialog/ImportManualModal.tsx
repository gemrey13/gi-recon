import { useAppSound } from "@renderer/hooks/useAppSound";
import { logger } from "@renderer/lib/logger";
import { Platform } from "@shared/constants.types";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  platform: Platform;
  onClose: () => void;
}

const config: Record<
  Platform,
  {
    label: string;
    description: string;
    apiCall: () => Promise<any>;
    color: string;
    hoverBorder: string;
    hoverBg: string;
    pulse: string;
  }
> = {
  panda: {
    label: "Foodpanda",
    description:
      "Upload the merchant report file exported from the Foodpanda Portal to reconcile with local POS logs.",
    apiCall: () => window.api.importManual("PANDA"),
    color: "text-pink-500",
    hoverBorder: "hover:border-pink-400",
    hoverBg: "hover:bg-pink-50/50",
    pulse: "bg-pink-500",
  },
  grab: {
    label: "GrabFood",
    description:
      "Upload the merchant report file exported from the Grab Portal to reconcile with local POS logs.",
    apiCall: () => window.api.importManual("GRAB"),
    color: "text-emerald-500",
    hoverBorder: "hover:border-emerald-400",
    hoverBg: "hover:bg-emerald-50/50",
    pulse: "bg-indigo-500",
  },
};

const ImportManualModal: React.FC<Props> = ({ platform, onClose }) => {
  const [status, setStatus] = useState<string>("Ready for ingestion");
  const [loading, setLoading] = useState(false);
  const { playSound } = useAppSound();
  const cfg = config[platform];

  const handleImport = async () => {
    setLoading(true);
    setStatus("Reading file buffer...");

    logger.info(
      "IMPORT_SERVICE",
      "CLICK",
      `${cfg.label} manual import started`,
      "User triggered manual file import from modal",
    );

    try {
      const result = await cfg.apiCall();

      if (result.totalInserted === 0) {
        playSound("error");
        toast.error(`${result.message}`);
        setStatus("Process aborted: No valid records found");
        logger.warn(
          "IMPORT_SERVICE",
          "RECON_RUN",
          `${cfg.label} import returned 0 records`,
          result.message ?? "No valid records found in uploaded file",
        );
      } else {
        playSound("success");
        toast.success(`Success: ${result.totalInserted} records synchronized.`);
        logger.info(
          "IMPORT_SERVICE",
          "RECON_SAVE",
          `${cfg.label} import successful`,
          `${result.totalInserted} records written to database`,
        );
        onClose();
      }
    } catch (err: any) {
      playSound("error");
      setStatus(`System Error: ${err.message}`);
      logger.error(
        "IMPORT_SERVICE",
        "API_ERROR",
        `${cfg.label} import failed`,
        err.message ?? "Unknown error during manual import",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 flex flex-col items-center animate-in fade-in zoom-in duration-200">
        <Header
          status={status}
          loading={loading}
          pulseColor={cfg.pulse}
          platform={cfg.label}
          description={cfg.description}
        />

        <div className="flex justify-center mb-8 w-full">
          <FilePicker
            label="Merchant Transaction Report"
            subLabel="Supported: CSV, XLSX"
            icon="📄"
            onClick={handleImport}
            loading={loading}
            hoverBorder={cfg.hoverBorder}
            hoverBg={cfg.hoverBg}
          />
        </div>

        <div className="flex gap-4 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 cursor-pointer font-bold text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors disabled:opacity-30">
            Cancel Upload
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = ({ status, loading, pulseColor, platform, description }: any) => (
  <div className="mb-6 text-center w-full">
    <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">
      {platform} Data Ingestion
    </h3>
    <div className="flex items-center justify-center gap-2">
      {loading && <span className={`w-2 h-2 ${pulseColor} rounded-full animate-pulse`} />}
      <p className="text-slate-500 text-xs font-medium">{status}</p>
    </div>
    <p className="text-slate-400 text-[10px] mt-4 leading-relaxed max-w-70 mx-auto">
      {description}
    </p>
  </div>
);

const FilePicker = ({ label, subLabel, icon, onClick, loading, hoverBorder, hoverBg }: any) => (
  <button
    onClick={!loading ? onClick : undefined}
    disabled={loading}
    className={`border-2 border-dashed border-slate-200 rounded-2xl p-10
               flex flex-col items-center justify-center
               ${hoverBorder} ${hoverBg}
               transition-all cursor-pointer group w-full max-w-xs
               disabled:opacity-50 disabled:cursor-wait outline-none`}>
    <span
      className={`text-4xl mb-4 transition-transform ${loading ? "animate-bounce" : "group-hover:scale-110"}`}>
      {loading ? "⏳" : icon}
    </span>
    <p className="text-sm font-bold text-slate-700">{label}</p>
    <p className="text-[11px] text-slate-400 mt-1">{subLabel}</p>
  </button>
);

export default ImportManualModal;
