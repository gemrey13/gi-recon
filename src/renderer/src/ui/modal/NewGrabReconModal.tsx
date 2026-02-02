import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { parseGrabFile, parsePOSFile } from "@renderer/utils/parseFile";

interface Props {
  onClose: () => void;
}

const NewGrabReconModal: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<{ pos: File | null; grab: File | null }>({
    pos: null,
    grab: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const formattedReconDate = new Date().toLocaleDateString();

  const handleStart = async () => {
    // Separate the toast from the return to ensure the function returns 'void'
    if (!files.pos || !files.grab) {
      toast.error("Please select both files.");
      return; // Now this correctly returns undefined/void
    }

    setIsProcessing(true);
    try {
      const grabData = await parseGrabFile(files.grab);
      const targetDate = grabData[0].created_on as string;
      const posData = await parsePOSFile(files.pos, targetDate);

      const result = await (window as any).api.startRecon({
        partner: "GRAB",
        posRows: posData,
        grabRows: grabData,
      });

      if (result.errors) {
        handleErrors(result.errors);
      } else {
        toast.success("Reconciliation completed!");
        onClose();
        navigate(`/recon/grab/${result.sessionId}`);
      }
    } catch (err) {
      toast.error((err as Error).message || "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleErrors = (errors: any) => {
    const { posErrors, grabErrors } = errors;
    if (grabErrors?.some((e: any) => e.error?.code === "SQLITE_CONSTRAINT_UNIQUE")) {
      toast.error("Duplicate Data: These Grab transactions already exist in the database.", {
        duration: 6000,
        icon: "🚫",
      });
      return;
    }

    if (grabErrors?.length) {
      toast.error(`Grab: ${grabErrors.length} records failed to insert.`);
    }
    if (posErrors?.length) {
      toast.error(`POS: ${posErrors.length} records failed. Date might already be reconciled.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
        <Header date={formattedReconDate} />

        <div className="grid grid-cols-2 gap-6 mb-8">
          <FilePicker
            label="POS (DBF)"
            icon={files.pos ? "✅" : "📄"}
            file={files.pos}
            accept=".dbf"
            onSelect={(f) => setFiles((prev) => ({ ...prev, pos: f }))}
          />
          <FilePicker
            label="Grab (CSV)"
            icon={files.grab ? "✅" : "📊"}
            file={files.grab}
            accept=".csv"
            onSelect={(f) => setFiles((prev) => ({ ...prev, grab: f }))}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 font-bold text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={isProcessing}
            className="flex-2 bg-slate-900 text-white py-4 rounded-2xl font-black tracking-widest hover:bg-black transition-all uppercase text-xs disabled:bg-slate-400">
            {isProcessing ? "Processing..." : "Start Engine"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components to clean up JSX ---

const Header = ({ date }: { date: string }) => (
  <div className="mb-8">
    <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">New Reconciliation</h3>
    <p className="text-slate-500 text-xs">
      Reconciliation Date: <span className="font-bold">{date}</span>
    </p>
    <p className="text-slate-500 text-[10px] mt-2 italic">
      Select local files to begin the automated audit.
    </p>
  </div>
);

const FilePicker = ({ label, icon, file, onSelect, accept }: any) => (
  <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group">
    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</span>
    <p className="text-xs font-bold text-slate-600">{label}</p>
    <p className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">
      {file ? file.name : "Select File"}
    </p>
    <input
      type="file"
      className="hidden"
      accept={accept}
      onChange={(e) => onSelect(e.target.files?.[0] || null)}
    />
  </label>
);

export default NewGrabReconModal;
