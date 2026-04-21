import { useState } from "react";
import toast from "react-hot-toast";
import { useAppSound } from "@renderer/hooks/useAppSound";

interface Props {
  onCancel: () => void;
}

const ImportPOSModal: React.FC<Props> = ({ onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("Ready to import");
  const { playSound } = useAppSound();

  const handlePOSImport = async () => {
    setLoading(true);
    setStatus("Importing...");

    try {
      const result = await window.api.importPOSZip();

      if (result.totalInserted === 0) {
        playSound("error");
        toast.error(`${result.message}`);
        setStatus("No records inserted");
      } else {
        playSound("success");
        toast.success(`Inserted: ${result.message}`);
        setStatus("Import complete ✅");
        setTimeout(onCancel, 600);
      }
    } catch (err: any) {
      playSound("error");
      toast.error(`Error ❌ ${err.message}`);
      setStatus("Error occurred");
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white w-72 rounded-2xl shadow-2xl p-5 flex flex-col gap-3 animate-in fade-in zoom-in duration-200">
      
      {/* Header */}
      <div>
        <h3 className="text-sm font-black text-slate-800 tracking-tight">POS Data Import</h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          {loading && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />}
          <p className="text-[10px] text-slate-400 font-medium">{status}</p>
        </div>
      </div>

      {/* Action Card */}
      <button
        onClick={!loading ? handlePOSImport : undefined}
        disabled={loading}
        className="border-2 border-dashed border-slate-200 rounded-xl p-5
                   flex flex-col items-center justify-center gap-2
                   hover:border-indigo-400 hover:bg-indigo-50/50
                   transition-all cursor-pointer group w-full
                   disabled:opacity-50 disabled:cursor-wait outline-none">
        <span className={`text-2xl transition-transform ${loading ? "animate-bounce" : "group-hover:scale-110"}`}>
          {loading ? "⚙️" : "🗃️"}
        </span>
        <div className="text-center">
          <p className="text-xs font-bold text-slate-700">Import POS Data</p>
          <p className="text-[10px] text-slate-400">Write ZIP contents to database</p>
        </div>
      </button>

      {/* Cancel */}
      <button
        onClick={onCancel}
        disabled={loading}
        className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest
                   hover:text-slate-600 transition-colors disabled:opacity-30 py-1">
        Cancel Import
      </button>
    </div>
  </div>
);
};

export default ImportPOSModal;