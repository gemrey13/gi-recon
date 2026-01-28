export interface NormalizedMatch {
  originalId: string;   // The full Grab/Panda ID
  searchKey: string;    // e.g., "G-QHAV"
  sortedKey: string;    // e.g., "AHQV" (for jumbled entries)
}

/**
 * Normalizes characters to handle common cashier typos (O vs 0, I vs 1)
 */
export function sanitizeString(str: string): string {
  if (!str) return "";
  return str
    .toUpperCase()
    .replace(/[0O]/g, "0") // Treat all O's as zeros
    .replace(/[1I]/g, "1") // Treat all I's as ones
    .trim();
}

/**
 * Transforms a Partner ID into the expected POS format (Prefix-Last4)
 * and generates a sorted version for jumbled matching.
 */
export function transformPartnerId(id: string, partner: 'GRAB' | 'PANDA'): NormalizedMatch {
  const cleanId = id.trim();
  const lastFour = cleanId.slice(-4);
  const prefix = partner === 'GRAB' ? 'G-' : 'P-';
  
  const searchKey = `${prefix}${lastFour}`;
  
  // Create an alphabetically sorted version of the last 4 for jumbled matching
  const sortedKey = lastFour.split('').sort().join('');

  return {
    originalId: cleanId,
    searchKey: sanitizeString(searchKey),
    sortedKey: sanitizeString(sortedKey)
  };
}