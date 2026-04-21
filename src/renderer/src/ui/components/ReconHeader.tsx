import { Branch } from "@renderer/types/grabrecon";

interface ReconHeaderProps {
  branches: Branch[];
  selectedBranch: string;
  startDate: string;
  endDate: string;
  loading: boolean;
  onBranchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onRunRecon: () => void;
}

const ReconHeader = ({
  branches,
  selectedBranch,
  startDate,
  endDate,
  loading,
  onBranchChange,
  onStartDateChange,
  onEndDateChange,
  onRunRecon,
}: ReconHeaderProps) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-end gap-4">
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Branch
      </label>
      <select
        value={selectedBranch}
        onChange={(e) => onBranchChange(e.target.value)}
        className="border border-slate-200 rounded-lg p-2 text-sm outline-none bg-slate-50 w-48">
        <option value="ALL">All Branches</option>
        {branches.map((b) => (
          <option key={b.pos_code} value={b.pos_name}>
            {b.partner_name}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="border border-slate-200 rounded-lg p-2 text-sm outline-none bg-slate-50"
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="border border-slate-200 rounded-lg p-2 text-sm outline-none bg-slate-50"
      />
    </div>

    <button
      onClick={onRunRecon}
      disabled={loading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-all ml-auto">
      {loading ? "Calculating..." : "Run Reconciliation"}
    </button>
  </div>
);

export default ReconHeader;
