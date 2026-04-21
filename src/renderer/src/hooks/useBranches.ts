import { Branch } from "@shared/grab-recon.types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchList: Branch[] = await window.api.getBranch("GRAB");
        setBranches(branchList);
      } catch {
        toast.error("Failed to fetch branches.");
      }
    };

    fetchBranches();
  }, []);

  return { branches };
};