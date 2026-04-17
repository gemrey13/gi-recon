import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TestingPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reconData, setReconData] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);

  // Input States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");

  useEffect(() => {
    async function fetchBranches() {
      try {
        const branchList = await window.api.getBranch("GRAB");
        setBranches(branchList);
      } catch (error) {
        toast.error("Failed to fetch branches.");
      }
    }
    fetchBranches();
  }, []);

  const handleRunRecon = async () => {
    if (!startDate) {
      toast.error("Please select a date range.");
      return;
    }

    setLoading(true);

    window.api.sendSystemLog({
      level: "INFO",
      module: "UI",
      action: "CLICK",
      message: "User initiated Grab Reconciliation",
      description: `Branch: ${selectedBranch}, Range: ${startDate} to ${endDate}`,
    });
    try {
      // 1. Run the math logic
      const data = await window.api.runGrabRecon(startDate, endDate, selectedBranch);

      if (!data || (data.matched.length === 0 && data.unmatchedPos.length === 0)) {
        toast.error("No transactions found for this range.");

        window.api.sendSystemLog({
          level: "WARN",
          module: "GRAB_SERVICE",
          action: "RECON_RUN",
          message: "Recon completed with zero results",
          description: `No data found for ${selectedBranch} between ${startDate} and ${endDate}`,
        });

        setReconData(null);
        return;
      }

      window.api.sendSystemLog({
        level: "INFO",
        module: "GRAB_SERVICE",
        action: "RECON_RUN",
        message: "Recon calculation successful",
        description: `Matched: ${data.matched.length}, Unmatched POS: ${data.unmatchedPos.length}`,
      });

      setReconData(data);
      toast.success("Reconciliation complete! Review the results below.");
      console.log("Draft Results:", data);
    } catch (error: any) {
      toast.error("Failed to run reconciliation.");

      window.api.sendSystemLog({
        level: "ERROR",
        module: "UI",
        action: "RECON_RUN",
        message: "UI crash/error during recon run",
        description: error.message || "Unknown Error",
        user_name: "Gem",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDb = async () => {
    if (!reconData) return;

    setSaving(true);

    window.api.sendSystemLog({
      level: "INFO",
      module: "UI",
      action: "CLICK",
      message: "User clicked Save to Database",
      description: `Target Branch: ${reconData.range.branch}, Date Range: ${reconData.range.startDate} to ${reconData.range.endDate}`,
    });
    try {
      const response = await window.api.saveGrabRecon(reconData.range, reconData);

      if (response.success) {
        toast.success(response.message);

        window.api.sendSystemLog({
          level: "INFO",
          module: "UI",
          action: "RECON_SAVE",
          message: "Reconciliation successfully saved to DB",
          description: `Successfully persisted data for ${reconData.range.branch}`,
        });
      }
    } catch (error: any) {
      toast.error("Error saving to database.");
      console.error(error);

      window.api.sendSystemLog({
        level: "ERROR",
        module: "UI",
        action: "RECON_SAVE",
        message: "UI failed to save reconciliation",
        description: error.message || "Unknown error in handleSaveToDb",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={handleRunRecon}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 transition-colors">
          {loading ? "Calculating..." : "Run Reconciliation"}
        </button>

        {reconData && (
          <button
            onClick={handleSaveToDb}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Finalize & Save to DB"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* START DATE */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* END DATE */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* BRANCH SELECT */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Branch</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
            <option value="ALL">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.pos_code} value={branch.pos_name}>
                {branch.partner_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {reconData && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-700">Summary for {reconData.range.branch}</h3>
          <p className="text-sm text-gray-600">Matched: {reconData.matched.length}</p>
          <p className="text-sm text-gray-600">Unmatched POS: {reconData.unmatchedPos.length}</p>
          <p className="text-sm text-gray-600">Unmatched Grab: {reconData.unmatchedGrab.length}</p>
        </div>
      )}
    </div>
  );
};

export default TestingPage;
