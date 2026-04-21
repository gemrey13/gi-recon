import { FiAlertTriangle, FiCheckCircle, FiX } from "react-icons/fi";

interface ConfirmSaveModalProps {
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmGrabSaveDBModal = ({ saving, onConfirm, onCancel }: ConfirmSaveModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 p-2 rounded-xl">
            <FiAlertTriangle className="text-emerald-600 text-xl" />
          </div>
          <div>
            <h2 className="font-black text-slate-800 uppercase tracking-tight text-sm">
              Confirm Save to Database
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          disabled={saving}
          className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50">
          <FiX className="text-lg" />
        </button>
      </div>

      {/* Body */}
      <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
        You are about to permanently save all current reconciliation matches — including any manual
        matches — to the database.
        <br />
        <br />
        <span className="font-semibold text-slate-700">Are you sure you want to proceed?</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-1">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 disabled:opacity-50 transition-all flex items-center gap-2">
          {saving ? (
            "Saving..."
          ) : (
            <>
              <FiCheckCircle /> Yes, Save to DB
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmGrabSaveDBModal;
