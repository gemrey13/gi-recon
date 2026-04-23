import ReconHeader from "@renderer/components/shared/ReconHeader";
import ImportBatchModal from "@renderer/components/shared/dialog/ImportBatchModal";
import ImportManualModal from "@renderer/components/shared/dialog/ImportManualModal";
import PartnerTitle from "@renderer/components/shared/PartnerTitle";
import { useBranches } from "@renderer/hooks/useBranches";
import { useRecon } from "@renderer/hooks/useRecon";
import { useState } from "react";
import PartnerMetricsCard from "@renderer/components/shared/PartnerMetricsCard";

const PandaPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [showAddPanda, setShowAddPanda] = useState(false);
  const [showAddPandaBatch, setShowAddPandaBatch] = useState(false);

  const { branches } = useBranches("PANDA");
  const { loading, saving, reconData, setReconData, runRecon, saveToDb } = useRecon("PANDA");

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
        </>
      )}

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
