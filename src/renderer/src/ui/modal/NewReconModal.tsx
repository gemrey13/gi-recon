import { parseGrabFile, parsePOSFile } from "@renderer/utils/parseFile";
import React, { useState } from "react";

interface Props {
  onClose: () => void;
}

const NewReconModal: React.FC<Props> = ({ onClose }) => {
  const [posFile, setPosFile] = useState<File | null>(null);
  const [grabFile, setGrabFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reconciliation date (today)
  const reconDate = new Date();
  const formattedReconDate = `${reconDate.getMonth() + 1}/${reconDate.getDate()}/${reconDate.getFullYear()}`;

  const handleStart = async () => {
    if (!posFile || !grabFile) {
      alert("Select both files");
      return;
    }

    setIsProcessing(true);

    try {
      const posData = await parsePOSFile(posFile);
      const grabData = await parseGrabFile(grabFile);

      console.group("📊 FRONTEND PARSED DATA");
      console.log("Reconciliation Date:", formattedReconDate);
      console.log("POS DATA:", posData);
      console.log("GRAB DATA:", grabData);
      console.groupEnd();

      // Next: reconciliation logic
    } catch (err) {
      console.error("Parsing failed:", err);
      alert((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
        {/* ----------------- HEADER ----------------- */}
        <div className="mb-4">
          <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">
            New Reconciliation
          </h3>
          <p className="text-slate-500 text-xs">
            Reconciliation Date: <span className="font-bold">{formattedReconDate}</span>
          </p>
        </div>

        <p className="text-slate-500 text-xs mb-8">
          Select local files to begin the automated audit.
        </p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* POS Input */}
          <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer">
            <span className="text-3xl mb-3">{posFile ? "✅" : "📄"}</span>
            <p className="text-xs font-bold text-slate-600">POS Data (DBF)</p>
            <p className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">
              {posFile ? posFile.name : "Select File"}
            </p>
            <input
              type="file"
              className="hidden"
              accept=".dbf"
              onChange={(e) => setPosFile(e.target.files?.[0] || null)}
            />
          </label>

          {/* Grab Input */}
          <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer">
            <span className="text-3xl mb-3">{grabFile ? "✅" : "📊"}</span>
            <p className="text-xs font-bold text-slate-600">Grab (CSV)</p>
            <p className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">
              {grabFile ? grabFile.name : "Select File"}
            </p>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={(e) => setGrabFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="cursor-pointer flex-1 py-3 font-bold text-slate-400 uppercase text-[10px] tracking-widest disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={isProcessing}
            className="cursor-pointer flex-2 bg-slate-900 text-white py-4 rounded-2xl font-black tracking-widest hover:bg-black transition-all uppercase text-xs disabled:bg-slate-400">
            {isProcessing ? "Processing..." : "Start Engine"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewReconModal;
