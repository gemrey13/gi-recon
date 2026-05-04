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
  const [partnerBasket, setPartnerBasket] = useState<UnmatchedPartnerTransaction[]>([]);
  const [posBasket, setPosBasket] = useState<PosTransaction[]>([]);

  const basketTotal: number = posBasket.reduce((sum, item) => sum + item.amount, 0);
  const partnerTotal: number = partnerBasket.reduce((sum, item) => sum + getPartnerAmount(item), 0);
  const difference: number = basketTotal - partnerTotal;
  const isMatchPossible: boolean = partnerBasket.length > 0 && posBasket.length > 0;

  const togglePos = (item: PosTransaction): void => {
    setPosBasket((prev) =>
      prev.some((p) => p.id === item.id) ? prev.filter((p) => p.id !== item.id) : [...prev, item],
    );
  };

  const togglePartner = (item: UnmatchedPartnerTransaction): void => {
    setPartnerBasket((prev) =>
      prev.some((p) => p.id === item.id) ? prev.filter((p) => p.id !== item.id) : [...prev, item],
    );
  };

  const commitMatch = (): void => {
    if (partnerBasket.length === 0 || posBasket.length === 0) return;

    const posIds: number[] = posBasket.map((p) => p.id);
    const partnerIds: (number | string)[] = partnerBasket.map((p) => p.id);

    let matchLevel: MatchedTransaction["match_level"];

    if (Math.abs(difference) > 0) {
      matchLevel = "MANUAL_TOLERANCE";
    } else if (posBasket.length > 1 || partnerBasket.length > 1) {
      matchLevel = "MANUAL_BATCH";
    } else {
      matchLevel = "MANUAL_SINGLE";
    }

    // Create a cross-product of matched transactions (each POS paired with each partner)
    const newMatches: MatchedTransaction[] = posBasket.flatMap((pos) =>
      partnerBasket.map((partner) => ({
        pos_id: pos.id,
        partner_id: partner.id,
        pos_amount: pos.amount,
        partner_amount: getPartnerAmount(partner),
        amount_diff: difference,
        branch_name: pos.branch_name,
        orddate: pos.orddate,
        match_level: matchLevel,
      })),
    );

    setReconData((prev): ReconData | null => {
      if (!prev) return prev;
      return {
        ...prev,
        matched: [...prev.matched, ...newMatches],
        unmatchedPos: prev.unmatchedPos.filter((p) => !posIds.includes(p.id)),
        unmatchedPartner: prev.unmatchedPartner.filter((g) => !partnerIds.includes(g.id)),
      };
    });

    const isManyToMany = posBasket.length > 1 && partnerBasket.length > 1;
    const isOneToMany = posBasket.length === 1 && partnerBasket.length > 1;
    const isManyToOne = posBasket.length > 1 && partnerBasket.length === 1;

    let successMsg: string;
    if (Math.abs(difference) > 0) {
      successMsg = `Matched with ₱${difference.toFixed(2)} variance`;
    } else if (isManyToMany) {
      successMsg = `Batch matched ${posBasket.length} POS ↔ ${partnerBasket.length} Partner rows`;
    } else if (isOneToMany) {
      successMsg = `Matched 1 POS ↔ ${partnerBasket.length} Partner rows`;
    } else if (isManyToOne) {
      successMsg = `Matched ${posBasket.length} POS ↔ 1 Partner row`;
    } else {
      successMsg = "Perfect Match Saved!";
    }

    toast.success(successMsg);

    setPosBasket([]);
    setPartnerBasket([]);
  };

  return {
    // Partner basket (replaces selectedPartner)
    partnerBasket,
    partnerTotal,
    togglePartner,
    // POS basket
    posBasket,
    basketTotal,
    // Shared
    difference,
    isMatchPossible,
    togglePos,
    commitMatch,
    // Keep selectedPartner alias for backward compat if needed elsewhere
    selectedPartner: partnerBasket.length === 1 ? partnerBasket[0] : null,
    setSelectedPartner: (item: UnmatchedPartnerTransaction | null) => {
      if (item === null) setPartnerBasket([]);
      else setPartnerBasket([item]);
    },
    partnerAmount: partnerTotal,
  };
};
