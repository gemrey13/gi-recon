import { FiCheckCircle } from "react-icons/fi";

interface MatchingWorkspaceProps {
  basketTotal: number;
  grabAmount: number;
  difference: number;
  isMatchPossible: boolean;
  onCommit: () => void;
}

const MatchingWorkspace = ({
  basketTotal,
  grabAmount,
  difference,
  isMatchPossible,
  onCommit,
}: MatchingWorkspaceProps) => {
  const fillPercent = grabAmount > 0
    ? Math.min((basketTotal / grabAmount) * 100, 100)
    : 0;

  const isPerfectMatch = Math.abs(difference) < 1;

  return (
    <div className="lg:col-span-4 flex flex-col gap-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col items-center justify-center text-center space-y-4 h-full">
        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-slate-500 uppercase font-bold px-2">
            <span>POS Basket</span>
            <span>₱{basketTotal.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 uppercase font-bold px-2">
            <span>Grab Target</span>
            <span>₱{grabAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Difference indicator */}
        <div
          className={`text-2xl font-black ${
            isPerfectMatch ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          Diff: ₱{difference.toFixed(2)}
        </div>

        {/* Confirm button */}
        <button
          disabled={!isMatchPossible}
          onClick={onCommit}
          className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-20 hover:bg-black transition-all"
        >
          <FiCheckCircle /> Confirm Manual Match
        </button>

        <p className="text-[10px] text-slate-400">
          Select 1 Grab row and 1 or more POS rows to match them.
        </p>
      </div>
    </div>
  );
};

export default MatchingWorkspace;