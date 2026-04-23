import { useState } from "react";
import toast from "react-hot-toast";
import { logger } from "@renderer/lib/logger";
import { ReconDataPanda } from "@shared/grab-recon.types";
import { useAppSound } from "@renderer/hooks/useAppSound";

export const usePandaRecon = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reconData, setReconData] = useState<ReconDataPanda | null>(null);

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
      "User initiated Panda Reconciliation",
      `Branch: ${branch}, Range: ${startDate} to ${endDate}`,
    );

    try {
      const data: ReconDataPanda = await window.api.runPandaRecon(startDate, endDate, branch);
      const isEmpty = !data || (data.matched.length === 0 && data.unmatchedPos.length === 0);

      if (isEmpty) {
        toast.error("No transactions found for this range.");
        logger.warn(
          "PANDA_SERVICE",
          "RECON_RUN",
          "Recon completed with zero results",
          `No data found for ${branch} between ${startDate} and ${endDate}`,
        );
        setReconData(null);
        return;
      }

      logger.info(
        "PANDA_SERVICE",
        "RECON_RUN",
        "Recon calculation successful",
        `Matched: ${data.matched.length}, Unmatched POS: ${data.unmatchedPos.length}`,
      );

      setReconData(data);
      console.log("Reconciliation data updated in state:", data);
      toast.success("Reconciliation complete!");
    } catch (error: any) {
      logger.error(
        "UI",
        "RECON_RUN",
        "UI crash/error during recon run",
        error?.message ?? "Unknown Error",
      );
      toast.error("Failed to run reconciliation.");
    } finally {
      setLoading(false);
    }
  };

  const saveToDb = async (reconData: ReconDataPanda) => {
    setSaving(true);
    logger.info(
      "UI",
      "CLICK",
      "User clicked Save to Database",
      `Target Branch: ${reconData.range.branch}, Date Range: ${reconData.range.startDate} to ${reconData.range.endDate}`,
    );

    try {
      const response = await window.api.savePandaRecon(reconData.range, reconData);

      if (response.success) {
        toast.success(response.message);
        playSound("success");

        logger.info(
          "UI",
          "RECON_SAVE",
          "Reconciliation successfully saved to DB",
          `Successfully persisted data for ${reconData.range.branch}`,
        );
      }
    } catch (error: any) {
      toast.error("Error saving to database.");
      playSound("error");

      logger.error(
        "UI",
        "RECON_SAVE",
        "UI failed to save reconciliation",
        error?.message ?? "Unknown error in handleSaveToDb",
      );
    } finally {
      setSaving(false);
    }
  };

  return { loading, saving, reconData, setReconData, runRecon, saveToDb };
};
