import ImportPandaBatchModal from "@renderer/components/panda/modal/ImportPandaBatchModal";
import ImportPandaModal from "@renderer/components/panda/modal/ImportPandaModal";
import PartnerTitle from "@renderer/components/shared/PartnerTitle";
import { useState } from "react";

const PandaPage = () => {
  const [showAddPanda, setShowAddPanda] = useState(false);
  const [showAddPandaBatch, setShowAddPandaBatch] = useState(false);

  return (
    <div className="space-y-6 max-w-400 mx-auto">
      <PartnerTitle
        onAddPartner={() => setShowAddPanda(true)}
        onAddPartnerBatch={() => setShowAddPandaBatch(true)}
        title="FoodPanda"
      />

      {showAddPanda && <ImportPandaModal onClose={() => setShowAddPanda(false)} />}

      {showAddPandaBatch && <ImportPandaBatchModal onCancel={() => setShowAddPandaBatch(false)} />}
    </div>
  );
};

export default PandaPage;
