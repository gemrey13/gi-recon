import { useState } from "react";
import toast from "react-hot-toast";
import { logger } from "@renderer/lib/logger";
import { useAppSound } from "@renderer/hooks/useAppSound";
import { PartnerType, ReconData } from "@shared/recon.types";


export const useRecon = (partnerType: PartnerType) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reconData, setReconData] = useState<ReconData | null>(null);

  const { playSound } = useAppSound();

  const runRecon = async (startDate: string, endDate: string, branch: string) => {
    if (!startDate) {
      toast.error("Please select a date range.");
      return;
    }

    setLoading(true);
    logger.info(
      "UI",
      "CLICK",
      `User initiated ${partnerType} Reconciliation`,
      `Branch: ${branch}, Range: ${startDate} to ${endDate}`,
    );

    try {
      const data: ReconData = await window.api.runRecon(partnerType, startDate, endDate, branch);
      const isEmpty =
        !data ||
        (data.matched.length === 0 &&
          data.unmatchedPos.length === 0 &&
          data.unmatchedPartner.length === 0);

      if (isEmpty) {
        toast.error("No transactions found for this range.");
        logger.warn(
          `${partnerType}_SERVICE`,
          "RECON_RUN",
          "Recon completed with zero results",
          `No data found for ${branch} between ${startDate} and ${endDate}`,
        );
        setReconData(null);
        return;
      }

      logger.info(
        `${partnerType}_SERVICE`,
        "RECON_RUN",
        "Recon calculation successful",
        `Matched: ${data.matched.length}, Unmatched POS: ${data.unmatchedPos.length}, Unmatched Partner: ${data.unmatchedPartner.length}`,
      );

      setReconData(data);
      console.log("Reconciliation Data:", data);
      toast.success("Reconciliation complete!");
    } catch (error: any) {
      logger.error(
        "UI",
        "RECON_RUN",
        `UI crash during ${partnerType} recon`,
        error?.message ?? "Unknown Error",
      );
      toast.error("Failed to run reconciliation.");
    } finally {
      setLoading(false);
    }
  };

  const saveToDb = async (reconData: ReconData) => {
    setSaving(true);
    logger.info(
      "UI",
      "CLICK",
      "User clicked Save to Database",
      `Target Branch: ${reconData.range.branch}, Date Range: ${reconData.range.startDate} to ${reconData.range.endDate}`,
    );

    try {
      const response = await window.api.saveRecon(partnerType, reconData.range, reconData);

      if (response.success) {
        toast.success(response.message);
        playSound("success");
        logger.info(
          "UI",
          "RECON_SAVE",
          "Reconciliation successfully saved to DB",
          `Persisted data for ${reconData.range.branch}`,
        );
      }
    } catch (error: any) {
      toast.error("Error saving to database.");
      playSound("error");
      logger.error(
        "UI",
        "RECON_SAVE",
        `UI failed to save ${partnerType} reconciliation`,
        error?.message ?? "Unknown error in saveToDb",
      );
    } finally {
      setSaving(false);
    }
  };

  return { loading, saving, reconData, setReconData, runRecon, saveToDb };
};
