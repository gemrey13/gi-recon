import { databasePath } from "../utils";

interface BranchMapping {
  pos_code: string;
  pos_name: string;
  partner_name: string;
}

const PARTNER_COLUMN_MAP = {
  PANDA: "foodpanda_name",
  GRAB: "grab_name",
} as const;

export const getBranchMapping = (partner: keyof typeof PARTNER_COLUMN_MAP): BranchMapping[] => {
  const column = PARTNER_COLUMN_MAP[partner];

  // If the partner isn't in our map, we exit early
  if (!column) return [];

  const sql = `SELECT pos_code, pos_name, ${column} AS partner_name FROM branch_mapping`;

  return databasePath.prepare(sql).all() as BranchMapping[];
};
