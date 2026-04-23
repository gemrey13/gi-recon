import { useState } from "react";

// Hooks
import { useBranches } from "@renderer/hooks/useBranches";
import { useManualMatch } from "@renderer/hooks/useManualMatch";

// Components
import ReconHeader from "@renderer/components/grab/ReconHeader";
import UnmatchedPosTable from "@renderer/components/grab/UnmatchedPosTable";
import MatchingWorkspace from "@renderer/components/grab/MatchingWorkspace";
import UnmatchedGrabTable from "@renderer/components/grab/UnmatchedGrabTable";
import FinalizeFooter from "@renderer/components/grab/FinalizeFooter";
import GrabMetricsCard from "@renderer/components/grab/GrabMetricsCard";
import ConfirmGrabSaveDBModal from "@renderer/components/grab/modal/ConfirmGrabSaveDBModal";
import PartnerTitle from "@renderer/components/shared/PartnerTitle";
import ImportBatchModal from "@renderer/components/shared/ImportBatchModal";
import ImportManualModal from "@renderer/components/shared/ImportManualModal";
import { useRecon } from "@renderer/hooks/useRecon";

const GrabPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [showAddGrab, setShowAddGrab] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showAddGrabBatch, setShowAddGrabBatch] = useState(false);

  const { branches } = useBranches("GRAB");
  const { loading, saving, reconData, setReconData, runRecon, saveToDb } = useRecon("GRAB");
  const {
    selectedPartner,
    setSelectedPartner,
    posBasket,
    basketTotal,
    partnerAmount,
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
      <PartnerTitle
        onAddPartner={() => setShowAddGrab(true)}
        onAddPartnerBatch={() => setShowAddGrabBatch(true)}
        title="GrabFood"
      />

      <ReconHeader
        partnerType="GRAB"
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
              grabAmount={partnerAmount}
              difference={difference}
              isMatchPossible={isMatchPossible}
              onCommit={commitMatch}
            />

            <UnmatchedGrabTable
              items={reconData.unmatchedPartner}
              selectedGrab={selectedPartner}
              onSelect={setSelectedPartner}
            />
          </div>

          <FinalizeFooter
            saving={saving}
            onSave={() => setShowConfirmSave(true)} // ← was: () => saveToDb(reconData)
          />
        </>
      )}

      {showAddGrab && <ImportManualModal platform="grab" onClose={() => setShowAddGrab(false)} />}

      {showAddGrabBatch && (
        <ImportBatchModal platform="grab" onCancel={() => setShowAddGrabBatch(false)} />
      )}

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
