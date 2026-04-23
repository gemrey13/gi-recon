import { useState } from "react";

// Hooks
import { useBranches } from "@renderer/hooks/useBranches";
import { useManualMatch } from "@renderer/hooks/useManualMatch";
import { useRecon } from "@renderer/hooks/useRecon";

// Components
import ReconHeader from "@renderer/components/shared/ReconHeader";
import UnmatchedPosTable from "@renderer/components/shared/table/UnmatchedPosTable";
import MatchingWorkspace from "@renderer/components/shared/table/MatchingWorkspace";
import FinalizeFooter from "@renderer/components/ui/FinalizeFooter";
import PartnerTitle from "@renderer/components/shared/PartnerTitle";
import ImportBatchModal from "@renderer/components/shared/dialog/ImportBatchModal";
import ImportManualModal from "@renderer/components/shared/dialog/ImportManualModal";
import PartnerMetricsCard from "@renderer/components/shared/PartnerMetricsCard";
import UnmatchedPartnerTable from "@renderer/components/shared/table/UnmatchedPartnerTable";
import ConfirmSaveDBModal from "@renderer/components/shared/dialog/ConfirmSaveDBModal";

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
          <PartnerMetricsCard reconData={reconData} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-150">
            <UnmatchedPosTable
              items={reconData.unmatchedPos}
              basket={posBasket}
              onToggle={togglePos}
            />

            <MatchingWorkspace
              basketTotal={basketTotal}
              partnerAmount={partnerAmount}
              difference={difference}
              isMatchPossible={isMatchPossible}
              onCommit={commitMatch}
            />

            <UnmatchedPartnerTable
              partnerType="GRAB"
              items={reconData.unmatchedPartner}
              selectedPartner={selectedPartner}
              onSelect={setSelectedPartner}
            />
          </div>

          <FinalizeFooter
            saving={saving}
            onSave={() => setShowConfirmSave(true)}
          />
        </>
      )}

      {showAddGrab && <ImportManualModal platform="grab" onClose={() => setShowAddGrab(false)} />}

      {showAddGrabBatch && (
        <ImportBatchModal platform="grab" onCancel={() => setShowAddGrabBatch(false)} />
      )}

      {showConfirmSave && (
        <ConfirmSaveDBModal
          saving={saving}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirmSave(false)}
        />
      )}
    </div>
  );
};

export default GrabPage;
