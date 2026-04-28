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

const PandaPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [showAddPanda, setShowAddPanda] = useState(false);
  const [showAddPandaBatch, setShowAddPandaBatch] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [posSort, setPosSort] = useState<"asc" | "desc" | null>(null);
  const [partnerSort, setPartnerSort] = useState<"asc" | "desc" | null>(null);

  const { branches } = useBranches("PANDA");
  const { loading, saving, reconData, setReconData, runRecon, saveToDb } = useRecon("PANDA");
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

  const sortedUnmatchedPos = posSort
    ? [...(reconData?.unmatchedPos ?? [])].sort((a, b) =>
        posSort === "asc" ? a.amount - b.amount : b.amount - a.amount,
      )
    : (reconData?.unmatchedPos ?? []);

  const sortedUnmatchedPartner = partnerSort
    ? [...(reconData?.unmatchedPartner ?? [])].sort((a, b) => {
        const amountA = "amount" in a ? a.amount : a.gross_food_value;
        const amountB = "amount" in b ? b.amount : b.gross_food_value;
        return partnerSort === "asc" ? amountA - amountB : amountB - amountA;
      })
    : (reconData?.unmatchedPartner ?? []);

  return (
    <div className="space-y-6 max-w-400 mx-auto">
      <PartnerTitle
        onAddPartner={() => setShowAddPanda(true)}
        onAddPartnerBatch={() => setShowAddPandaBatch(true)}
        title="FoodPanda"
      />

      <ReconHeader
        partnerType="PANDA"
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
              items={sortedUnmatchedPos}
              sort={posSort}
              onSortChange={setPosSort}
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
              partnerType="PANDA"
              items={sortedUnmatchedPartner}
              sort={partnerSort}
              onSortChange={setPartnerSort}
              selectedPartner={selectedPartner}
              onSelect={setSelectedPartner}
            />
          </div>

          <FinalizeFooter saving={saving} onSave={() => setShowConfirmSave(true)} />
        </>
      )}

      {showAddPanda && (
        <ImportManualModal platform="panda" onClose={() => setShowAddPanda(false)} />
      )}

      {showAddPandaBatch && (
        <ImportBatchModal platform="panda" onCancel={() => setShowAddPandaBatch(false)} />
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

export default PandaPage;
