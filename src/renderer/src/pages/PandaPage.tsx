import PartnerTitle from "@renderer/components/shared/PartnerTitle";
import { useState } from "react";

const PandaPage = () => {
  const [showAddPanda, setShowAddPanda] = useState(false);
  const [showAddPandaBatch, setShowAddPandaBatch] = useState(false);

  return (
    <div className="space-y-6 max-w-400 mx-auto">
      <PartnerTitle
        onAddPanda={() => setShowAddPanda(true)}
        onAddPandaBatch={() => setShowAddPandaBatch(true)}
        title="FoodPanda"
      />
    </div>
  );
};

export default PandaPage;
