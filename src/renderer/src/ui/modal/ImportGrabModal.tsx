import React, { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
}

const ImportGrabModal: React.FC<Props> = ({ onClose }) => {
  const [status, setStatus] = useState<string>("Idle");
  const [loading, setLoading] = useState(false);

  const handleImportGrabManual = async () => {
    setLoading(true);
    setStatus("Importing GRAB Excel...");

    try {
      const result = await window.api.importGrabManual();
      setStatus(`Done ✅ Inserted: ${result.totalInserted} | ${result.message}`);
      toast(`Done ✅ Inserted: ${result.totalInserted} | ${result.message}`);
    } catch (err: any) {
      setStatus(`Error ❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
        <Header status={status} />

        <div className="grid grid-cols-2 gap-6 mb-8">
          <FilePicker
            label="Grab (CSV)"
            icon={"📊"}
            onClick={handleImportGrabManual}
            loading={loading}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 font-bold text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components to clean up JSX ---

const Header = ({ status }: any) => (
  <div className="mb-6">
    <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">Import Grab Data</h3>
    <p className="text-slate-500 text-xs">
      Status: <span className="font-bold">{status ?? "idle"}</span>
    </p>
    <p className="text-slate-500 text-[10px] mt-2 italic">
      Select grab files to begin the importing.
    </p>
  </div>
);

const FilePicker = ({ label, icon, onClick, loading }: any) => (
  <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group">
    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</span>
    <p className="text-xs font-bold text-slate-600">{label}</p>
    <p className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">Select File</p>

    <button onClick={onClick} disabled={loading} className="hidden">
      Import GRAB File
    </button>
  </label>
);

export default ImportGrabModal;
