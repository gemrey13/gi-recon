import { GrabItem, MatchedItem, PosItem } from "@shared/grab-recon.types";
import { ReconData } from "@shared/recon.types";
import { useState } from "react";
import toast from "react-hot-toast";

export const useManualMatch = (
  setReconData: React.Dispatch<React.SetStateAction<ReconData | null>>,
) => {
  const [selectedGrab, setSelectedGrab] = useState<GrabItem | null>(null);
  const [posBasket, setPosBasket] = useState<PosItem[]>([]);

  const basketTotal = posBasket.reduce((sum, item) => sum + item.amount, 0);
  const grabAmount = selectedGrab?.amount ?? 0;
  const difference = basketTotal - grabAmount;
  const isMatchPossible = selectedGrab !== null && posBasket.length > 0;

  const togglePos = (item: PosItem) => {
    setPosBasket((prev) =>
      prev.some((p) => p.id === item.id) ? prev.filter((p) => p.id !== item.id) : [...prev, item],
    );
  };

  const commitMatch = async () => {
    if (!selectedGrab || posBasket.length === 0) return;

    const posIds = posBasket.map((p) => p.id);

    const matchLevel: MatchedItem["match_level"] =
      posBasket.length > 1 ? "MANUAL_BATCH" : "MANUAL_SINGLE";

    const newMatches: MatchedItem[] = posBasket.map((p) => ({
      pos_id: p.id,
      grab_id: selectedGrab.id,
      pos_amount: p.amount,
      grab_amount: grabAmount,
      amount_diff: difference,
      branch_name: p.branch_name,
      orddate: p.orddate,
      status: Math.abs(p.amount - grabAmount) < 1 ? "Matched" : "Variance",
      match_level: matchLevel,
    }));

    setReconData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        matched: [...prev.matched, ...newMatches],
        unmatchedPos: prev.unmatchedPos.filter((p) => !posIds.includes(p.id)),
        unmatchedPartner: prev.unmatchedPartner.filter((g) => g.id !== selectedGrab.id),
      };
    });

    toast.success(
      Math.abs(difference) > 0
        ? `Matched with ₱${difference.toFixed(2)} variance`
        : "Perfect Match Saved!",
    );

    setPosBasket([]);
    setSelectedGrab(null);
  };

  return {
    selectedGrab,
    setSelectedGrab,
    posBasket,
    basketTotal,
    grabAmount,
    difference,
    isMatchPossible,
    togglePos,
    commitMatch,
  };
};
