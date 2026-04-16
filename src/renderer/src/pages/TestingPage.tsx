import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TestingPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reconData, setReconData] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);

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
    setLoading(true);
    try {
      // 1. Run the math logic
      const data = await window.api.runGrabRecon("2026-01-01");

      if (!data || (data.matched.length === 0 && data.unmatchedPos.length === 0)) {
        toast.error("No transactions found for this range.");
        setReconData(null);
        return;
      }

      setReconData(data);
      toast.success("Reconciliation complete! Review the results below.");
      console.log("Draft Results:", data);
    } catch (error) {
      toast.error("Failed to run reconciliation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDb = async () => {
    if (!reconData) return;

    setSaving(true);
    try {
      const response = await window.api.saveGrabRecon(reconData.range, reconData);

      if (response.success) {
        toast.success(response.message);
      }
    } catch (error) {
      toast.error("Error saving to database.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-4">
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

      <select className="border border-gray-300 rounded-md p-2 w-full max-w-xs">
        <option value="">Select Branch</option>
        {branches.map((branch) => (
          <option key={branch.pos_code} value={branch.pos_name}>
            {branch.partner_name}
          </option>
        ))}
      </select>

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
