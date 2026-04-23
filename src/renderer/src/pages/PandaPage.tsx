import ReconHeader from "@renderer/components/grab/ReconHeader";
import ImportBatchModal from "@renderer/components/shared/ImportBatchModal";
import ImportManualModal from "@renderer/components/shared/ImportManualModal";
import PartnerTitle from "@renderer/components/shared/PartnerTitle";
import { useBranches } from "@renderer/hooks/useBranches";
import { usePandaRecon } from "@renderer/hooks/usePandaRecon";
import { useState } from "react";

const PandaPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [showAddPanda, setShowAddPanda] = useState(false);
  const [showAddPandaBatch, setShowAddPandaBatch] = useState(false);

  const { branches } = useBranches("PANDA");
  const { loading, saving, reconData, setReconData, runRecon, saveToDb } = usePandaRecon();

  return (
    <div className="space-y-6 max-w-400 mx-auto">
      <PartnerTitle
        onAddPartner={() => setShowAddPanda(true)}
        onAddPartnerBatch={() => setShowAddPandaBatch(true)}
        title="FoodPanda"
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

      {showAddPanda && (
        <ImportManualModal platform="panda" onClose={() => setShowAddPanda(false)} />
      )}

      {showAddPandaBatch && (
        <ImportBatchModal platform="panda" onCancel={() => setShowAddPandaBatch(false)} />
      )}
    </div>
  );
};

export default PandaPage;
