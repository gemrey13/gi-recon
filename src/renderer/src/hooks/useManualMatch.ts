import {
  MatchedTransaction,
  PosTransaction,
  ReconData,
  UnmatchedPartnerTransaction,
} from "@shared/recon.types";
import { useState } from "react";
import toast from "react-hot-toast";

const getPartnerAmount = (partner: UnmatchedPartnerTransaction): number => {
  if ("amount" in partner) return partner.amount; // Grab
  if ("gross_food_value" in partner) return partner.gross_food_value; // Panda
  return 0;
};

export const useManualMatch = (
  setReconData: React.Dispatch<React.SetStateAction<ReconData | null>>,
) => {
  const [selectedPartner, setSelectedPartner] = useState<UnmatchedPartnerTransaction | null>(null);
  const [posBasket, setPosBasket] = useState<PosTransaction[]>([]);

  const basketTotal: number = posBasket.reduce((sum, item) => sum + item.amount, 0);
  const partnerAmount: number = selectedPartner ? getPartnerAmount(selectedPartner) : 0;
  const difference: number = basketTotal - partnerAmount;
  const isMatchPossible: boolean = selectedPartner !== null && posBasket.length > 0;

  const togglePos = (item: PosTransaction): void => {
    setPosBasket((prev) =>
      prev.some((p) => p.id === item.id) ? prev.filter((p) => p.id !== item.id) : [...prev, item],
    );
  };

  const commitMatch = (): void => {
    if (!selectedPartner || posBasket.length === 0) return;

    const posIds: number[] = posBasket.map((p) => p.id);
    const matchLevel: MatchedTransaction["match_level"] =
      posBasket.length > 1 ? "MANUAL_BATCH" : "MANUAL_SINGLE";

    const newMatches: MatchedTransaction[] = posBasket.map((p) => ({
      pos_id: p.id,
      partner_id: selectedPartner.id,
      pos_amount: p.amount,
      partner_amount: partnerAmount,
      amount_diff: difference,
      branch_name: p.branch_name,
      orddate: p.orddate,
      match_level: matchLevel,
    }));

    setReconData((prev): ReconData | null => {
      if (!prev) return prev;
      return {
        ...prev,
        matched: [...prev.matched, ...newMatches],
        unmatchedPos: prev.unmatchedPos.filter((p) => !posIds.includes(p.id)),
        unmatchedPartner: prev.unmatchedPartner.filter((g) => g.id !== selectedPartner.id),
      };
    });

    toast.success(
      Math.abs(difference) > 0
        ? `Matched with ₱${difference.toFixed(2)} variance`
        : "Perfect Match Saved!",
    );

    setPosBasket([]);
    setSelectedPartner(null);
  };

  return {
    selectedPartner,
    setSelectedPartner,
    posBasket,
    basketTotal,
    partnerAmount,
    difference,
    isMatchPossible,
    togglePos,
    commitMatch,
  };
};
