import { useState } from "react";

// Hooks
import { useBranches } from "@renderer/hooks/useBranches";
import { useGrabRecon } from "@renderer/hooks/useGrabRecon";
import { useManualMatch } from "@renderer/hooks/useManualMatch";

// Components
import ReconHeader from "@renderer/ui/components/ReconHeader";
import UnmatchedPosTable from "@renderer/ui/components/UnmatchedPosTable";
import MatchingWorkspace from "@renderer/ui/components/MatchingWorkspace";
import UnmatchedGrabTable from "@renderer/ui/components/UnmatchedGrabTable";
import FinalizeFooter from "@renderer/ui/components/FinalizeFooter";
import ImportGrabModal from "@renderer/ui/modal/ImportGrabModal";
import GrabTitle from "@renderer/ui/components/GrabTitle";
import GrabMetricsCard from "@renderer/ui/components/GrabMetricsCard";
import ConfirmGrabSaveDBModal from "@renderer/ui/modal/ConfirmGrabSaveDBModal";
import ImportGrabBatchModal from "@renderer/ui/modal/ImportGrabBatchModal";

const GrabPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [showAddGrab, setShowAddGrab] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showAddGrabBatch, setShowAddGrabBatch] = useState(false);

  const { branches } = useBranches();
  const { loading, saving, reconData, setReconData, runRecon, saveToDb } = useGrabRecon();
  const {
    selectedGrab,
    setSelectedGrab,
    posBasket,
    basketTotal,
    grabAmount,
    difference,
    isMatchPossible,
    togglePos,
    commitMatch,
  } = useManualMatch(setReconData);

  const handleConfirmSave = async () => {
    await saveToDb(reconData!);
    setShowConfirmSave(false);
  };

  return (
    <div className="space-y-6 max-w-400 mx-auto">
      <GrabTitle
        onAddGrab={() => setShowAddGrab(true)}
        onAddGrabBatch={() => setShowAddGrabBatch(true)}
      />

      <ReconHeader
        branches={branches}
        selectedBranch={selectedBranch}
        startDate={startDate}
        endDate={endDate}
        loading={loading}
        onBranchChange={setSelectedBranch}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onRunRecon={() => runRecon(startDate, endDate, selectedBranch)}
      />

      {reconData && (
        <>
          <GrabMetricsCard reconData={reconData} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-150">
            <UnmatchedPosTable
              items={reconData.unmatchedPos}
              basket={posBasket}
              onToggle={togglePos}
            />

            <MatchingWorkspace
              basketTotal={basketTotal}
              grabAmount={grabAmount}
              difference={difference}
              isMatchPossible={isMatchPossible}
              onCommit={commitMatch}
            />

            <UnmatchedGrabTable
              items={reconData.unmatchedGrab}
              selectedGrab={selectedGrab}
              onSelect={setSelectedGrab}
            />
          </div>

          <FinalizeFooter
            saving={saving}
            onSave={() => setShowConfirmSave(true)} // ← was: () => saveToDb(reconData)
          />
        </>
      )}

      {showAddGrab && <ImportGrabModal onClose={() => setShowAddGrab(false)} />}

      {showAddGrabBatch && <ImportGrabBatchModal onCancel={() => setShowAddGrabBatch(false)} />}

      {showConfirmSave && (
        <ConfirmGrabSaveDBModal
          saving={saving}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirmSave(false)}
        />
      )}
    </div>
  );
};

export default GrabPage;
