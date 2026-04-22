import { useState } from "react";
import toast from "react-hot-toast";
import { useAppSound } from "@renderer/hooks/useAppSound";

interface Props {
  onCancel: () => void;
}

const ImportPandaBatchModal: React.FC<Props> = ({ onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("Ready for batch synchronization");
  const { playSound } = useAppSound();

  const handleStartGrabImport = async () => {
    setLoading(true);
    setStatus("Scanning directory and preparing ledger...");

    try {
      const result = await window.api.startImportPanda();

      if (result.totalInserted === 0) {
        playSound("error");
        toast.error(`${result.message}`);
        setStatus("Sync aborted: No matches to commit");
      } else {
        playSound("success");
        toast.success(`Success: New records committed.`);
        setTimeout(onCancel, 600);
      }
    } catch (err: any) {
      playSound("error");
      setStatus(`System Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8
                   flex flex-col items-center
                   animate-in fade-in zoom-in duration-200">
        <Header status={status} loading={loading} />

        <div className="flex justify-center mb-8 w-full">
          <ActionCard
            label="Commit All Matches"
            subLabel="Permanently write to database"
            icon={"🗂️"}
            onClick={handleStartGrabImport}
            loading={loading}
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-3 cursor-pointer font-bold text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors disabled:opacity-0">
            Cancel Sync
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components (Matched to ImportGrabModal) ---

const Header = ({ status, loading }: any) => (
  <div className="mb-6 text-center w-full">
    <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">
      Batch Synchronization
    </h3>
    <div className="flex items-center justify-center gap-2">
      {loading && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
      <p className="text-slate-500 text-xs font-medium">{status}</p>
    </div>
    <p className="text-slate-400 text-[10px] mt-4 leading-relaxed max-w-70 mx-auto">
      You are about to permanently save all reconciled matches to the local database. This action
      will update the master transaction ledger.
    </p>
  </div>
);

const ActionCard = ({ label, subLabel, icon, onClick, loading }: any) => (
  <button
    onClick={!loading ? onClick : undefined}
    disabled={loading}
    className="border-2 border-dashed border-slate-200 rounded-2xl p-10
               flex flex-col items-center justify-center
               hover:border-emerald-400 hover:bg-emerald-50/50
               transition-all cursor-pointer group w-full max-w-xs
               disabled:opacity-50 disabled:cursor-wait outline-none">
    <span
      className={`text-4xl mb-4 transition-transform ${loading ? "animate-bounce" : "group-hover:scale-110"}`}>
      {loading ? "⚙️" : icon}
    </span>

    <p className="text-sm font-bold text-slate-700">{label}</p>
    <p className="text-[11px] text-slate-400 mt-1">{subLabel}</p>
  </button>
);

export default ImportPandaBatchModal;
