type MatchResult = {
  posId: number;
  grabId: number;
  variance: number;
  status: "matched" | "discrepancy";
};

function normalizeDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US");
}

function extractPosIdFromBooking(bookingId: string) {
  // A-8K3WT9HWX8E3AV → G-E3AV
  const suffix = bookingId.slice(-4);
  return `G-${suffix}`;
}

export function reconcilePOSvsGrab(
  posRows: any[],
  grabRows: any[]
): MatchResult[] {
  const matches: MatchResult[] = [];

  const usedGrab = new Set<number>();

  // PASS 1: strict
  for (const pos of posRows) {
    for (const grab of grabRows) {
      if (usedGrab.has(grab.id)) continue;

      const posId = pos.cusno;
      const grabId = extractPosIdFromBooking(grab.booking_id);

      if (posId !== grabId) continue;

      const sameDate =
        normalizeDate(pos.orddate) === normalizeDate(grab.created_on);

      const sameAmount =
        Number(pos.grschrg) === Number(grab.amount);

      if (sameDate && sameAmount) {
        matches.push({
          posId: pos.id,
          grabId: grab.id,
          variance: 0,
          status: "matched",
        });
        usedGrab.add(grab.id);
        break;
      }
    }
  }

  // PASS 2: discrepancy
  for (const pos of posRows) {
    if (matches.find((m) => m.posId === pos.id)) continue;

    for (const grab of grabRows) {
      if (usedGrab.has(grab.id)) continue;

      const posId = pos.cusno;
      const grabId = extractPosIdFromBooking(grab.booking_id);

      if (posId !== grabId) continue;

      const sameDate =
        normalizeDate(pos.orddate) === normalizeDate(grab.created_on);

      if (sameDate) {
        const variance =
          Number(pos.grschrg) - Number(grab.amount);

        matches.push({
          posId: pos.id,
          grabId: grab.id,
          variance,
          status: "discrepancy",
        });

        usedGrab.add(grab.id);
        break;
      }
    }
  }

  return matches;
}
