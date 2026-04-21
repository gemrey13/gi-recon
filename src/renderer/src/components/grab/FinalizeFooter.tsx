import { FiCheckCircle } from "react-icons/fi";

interface FinalizeFooterProps {
  saving: boolean;
  onSave: () => void;
}

const FinalizeFooter = ({ saving, onSave }: FinalizeFooterProps) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
    <div>
      <h3 className="font-black text-slate-800 uppercase tracking-tight">Finalize Results</h3>
      <p className="text-xs text-slate-500">
        This will save all current matches (including manual ones) to the permanent database.
      </p>
    </div>

    <button
      onClick={onSave}
      disabled={saving}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 disabled:opacity-50 transition-all flex items-center gap-2">
      {saving ? (
        "Saving..."
      ) : (
        <>
          <FiCheckCircle /> Finalize & Save to DB
        </>
      )}
    </button>
  </div>
);

export default FinalizeFooter;
