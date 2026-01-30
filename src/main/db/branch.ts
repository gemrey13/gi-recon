export function getBranchNameFromGrab(grabRows: any[]): string {
  if (!grabRows || grabRows.length === 0) return "UNKNOWN BRANCH";

  const firstRow = grabRows[0];

  // Try both snake_case and original CSV column name
  const branch =
    (firstRow.store_name ?? firstRow["Store Name"])?.toString().trim();

  return branch || "UNKNOWN BRANCH";
}
