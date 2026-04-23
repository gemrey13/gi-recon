import { Branch } from "@shared/grab-recon.types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Provider = "GRAB" | "PANDA";

export const useBranches = (initialProvider: Provider = "GRAB") => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider>(initialProvider);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Prevent execution if for some reason provider is undefined
    if (!selectedProvider) return;

    const fetchBranches = async () => {
      setIsLoading(true);
      try {
        const branchList: Branch[] = await window.api.getBranch(selectedProvider);
        setBranches(branchList);
        console.log(`Fetched ${branchList.length} branches for ${selectedProvider}`);
      } catch (error) {
        toast.error(`Failed to fetch ${selectedProvider} branches.`);
        setBranches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, [selectedProvider]);

  return {
    branches,
    selectedProvider,
    setSelectedProvider,
    isLoading,
  };
};
