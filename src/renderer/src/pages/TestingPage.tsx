import GrabMetricsCard from "@renderer/ui/components/GrabMetricsCard";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCheckCircle } from "react-icons/fi";

const TestingPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reconData, setReconData] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);

  // Input States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");

  // Selection/Basket States for Manual Matching
  const [selectedGrab, setSelectedGrab] = useState<any | null>(null);
  const [posBasket, setPosBasket] = useState<any[]>([]);

  const [useShortId, setUseShortId] = useState(false);

  // Calculate Basket Total and Difference
  const basketTotal = posBasket.reduce((sum, item) => sum + item.amount, 0);
  const grabAmount = selectedGrab?.amount || 0;
  const difference = basketTotal - grabAmount;
  const isMatchPossible = selectedGrab && posBasket.length > 0;

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

      console.log("Reconciliation Data:", data);
      setReconData(data);
      toast.success("Reconciliation complete!");
    } catch (error: any) {
      window.api.sendSystemLog({
        level: "ERROR",
        module: "UI",
        action: "RECON_RUN",
        message: "UI crash/error during recon run",
        description: error.message || "Unknown Error",
      });
      toast.error("Failed to run reconciliation.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePos = (item: any) => {
    setPosBasket((prev) =>
      prev.find((p) => p.id === item.id) ? prev.filter((p) => p.id !== item.id) : [...prev, item],
    );
  };
  const handleManualMatchCommit = async () => {
    if (!selectedGrab || posBasket.length === 0) return;

    const posIds = posBasket.map((p) => p.id);

    try {
      const res = await window.api.saveManualMatchBatch(
        posIds,
        selectedGrab.id,
        basketTotal, // Sum of the basket
        grabAmount, // The Grab row amount
      );

      if (res.success) {
        toast.success(
          Math.abs(difference) > 0
            ? `Matched with ₱${difference.toFixed(2)} variance`
            : "Perfect Match Saved!",
        );

        // --- Update UI State ---
        setReconData((prev: any) => ({
          ...prev,
          // Remove the matched items from the lists
          unmatchedPos: prev.unmatchedPos.filter((p: any) => !posIds.includes(p.id)),
          unmatchedGrab: prev.unmatchedGrab.filter((g: any) => g.id !== selectedGrab.id),
        }));

        // --- Reset Selection ---
        setPosBasket([]);
        setSelectedGrab(null);
      } else {
        toast.error(res.error || "Failed to save match.");
      }
    } catch (error) {
      toast.error("Bridge Error.");
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
    <div className="space-y-6 max-w-400 mx-auto">
      {/* HEADER CONTROLS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Branch
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
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
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Start
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-slate-200 rounded-lg p-2 text-sm outline-none bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            End
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-slate-200 rounded-lg p-2 text-sm outline-none bg-slate-50"
          />
        </div>
        <button
          onClick={handleRunRecon}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-all ml-auto">
          {loading ? "Calculating..." : "Run Reconciliation"}
        </button>
      </div>

      {reconData && (
        <>
          <GrabMetricsCard reconData={reconData} />
          {/* MANUAL MATCHING WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-150">
            {/* UNMATCHED POS (LEFT) */}
            <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700">
                  Unmatched POS ({reconData.unmatchedPos.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="text-[10px] text-slate-400 uppercase">
                      <th className="p-3">Select</th>
                      <th className="p-3">Branch / Date</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {reconData.unmatchedPos.map((p: any) => (
                      <tr
                        key={p.id}
                        onClick={() => handleTogglePos(p)}
                        className={`border-b border-slate-50 cursor-pointer transition-colors ${posBasket.find((x) => x.id === p.id) ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={!!posBasket.find((x) => x.id === p.id)}
                            readOnly
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-semibold">{p.cusno}</div>
                          <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                            <span>{p.orddate} </span>
                            <br />
                            <span>{p.branch_name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-indigo-600">
                          ₱{p.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MATCHING ACTION (CENTER) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col items-center justify-center text-center space-y-4 h-full">
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 uppercase font-bold px-2">
                    <span>POS Basket</span>
                    <span>₱{basketTotal.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{
                        width: `${Math.min((basketTotal / grabAmount) * 100, 100)}%`,
                      }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 uppercase font-bold px-2">
                    <span>Grab Target</span>
                    <span>₱{grabAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div
                  className={`text-2xl font-black ${Math.abs(difference) < 1 ? "text-emerald-500" : "text-rose-500"}`}>
                  Diff: ₱{difference.toFixed(2)}
                </div>

                <button
                  disabled={!isMatchPossible}
                  onClick={handleManualMatchCommit}
                  className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-20 hover:bg-black transition-all">
                  <FiCheckCircle /> Confirm Manual Match
                </button>

                <p className="text-[10px] text-slate-400">
                  Select 1 Grab row and 1 or more POS rows to match them.
                </p>
              </div>
            </div>

            {/* UNMATCHED GRAB (RIGHT) */}
            <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700">
                  Unmatched Grab ({reconData.unmatchedGrab.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="text-[10px] text-slate-400 uppercase">
                      <th
                        className="p-3 cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-1"
                        onClick={() => setUseShortId(!useShortId)}
                        title="Click to toggle ID format">
                        {useShortId ? "Short ID" : "Booking ID"}
                        <span className="text-[8px] bg-slate-100 px-1 rounded text-slate-400">
                          Toggle
                        </span>
                      </th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {reconData.unmatchedGrab.map((g: any) => (
                      <tr
                        key={g.id}
                        onClick={() => setSelectedGrab(g)}
                        className={`border-b border-slate-50 cursor-pointer transition-colors ${selectedGrab?.id === g.id ? "bg-amber-50 ring-1 ring-inset ring-amber-200" : "hover:bg-slate-50"}`}>
                        <td className="p-3">
                          <div className="font-semibold">
                            {useShortId ? g.short_order_id : g.booking_id}
                          </div>
                          <div className="text-slate-400 flex items-center gap-1">
                            {g.is_batched && (
                              <span className="bg-amber-100 text-amber-700 px-1 rounded text-[10px]">
                                BATCH ({g.id_count})
                              </span>
                            )}
                            <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                              <span>{g.created_on.split(" ")[0]}</span>
                              <br />
                              <span
                                className={ "font-semibold " +
                                  g.category === "Adjustment" ? "text-orange-500 " : g.status === "Cancelled" ? "text-rose-500 " : "text-emerald-500 "
                                }>
                                {g.category || g.status}
                              </span>
                              <br />
                              <span className="truncate">{g.store_name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-amber-600">
                          ₱{g.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FINALIZATION FOOTER */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">
                Finalize Results
              </h3>
              <p className="text-xs text-slate-500">
                This will save all current matches (including manual ones) to the permanent
                database.
              </p>
            </div>
            <button
              onClick={handleSaveToDb}
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
        </>
      )}
    </div>
  );
};

export default TestingPage;
