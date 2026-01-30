type MatchResult = {
  posId: number;
  grabId: number;
  variance: number;
  status: "matched" | "discrepancy" | "id_mismatch";
};

function normalizeDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US");
}

function sanitizeId(str: string) {
  if (!str) return "";
  return str.toUpperCase().replace(/[0O]/g, "0").replace(/[1I]/g, "1").trim();
}

function extractPosIdFromBooking(bookingId: string) {
  // A-8K3WT9HWX8E3AV → G-E3AV
  const suffix = bookingId.slice(-4);
  return `G-${suffix}`;
}

export function reconcilePOSvsGrab(posRows: any[], grabRows: any[]): MatchResult[] {
  const matches: MatchResult[] = [];

  const usedGrab = new Set<number>();

  // PASS 1: Strict match (ID + Date + Amount)
  for (const pos of posRows) {
    for (const grab of grabRows) {
      if (usedGrab.has(grab.id)) continue;

      const posId = sanitizeId(pos.cusno);
      const grabId = sanitizeId(extractPosIdFromBooking(grab.booking_id));

      if (posId !== grabId) continue;

      const sameDate = normalizeDate(pos.orddate) === normalizeDate(grab.created_on);

      const sameAmount = Number(pos.grschrg) === Number(grab.amount);

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

  // PASS 2: Discrepancy (ID + Date, Amount differs)
  for (const pos of posRows) {
    if (matches.find((m) => m.posId === pos.id)) continue;

    for (const grab of grabRows) {
      if (usedGrab.has(grab.id)) continue;

      const posId = sanitizeId(pos.cusno);
      const grabId = sanitizeId(extractPosIdFromBooking(grab.booking_id));

      if (posId !== grabId) continue;

      const sameDate = normalizeDate(pos.orddate) === normalizeDate(grab.created_on);

      if (sameDate) {
        const variance = Number(pos.grschrg) - Number(grab.amount);

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

  // PASS 3: Soft match (Date + Amount, different ID)
  for (const pos of posRows) {
    if (matches.find((m) => m.posId === pos.id)) continue;

    for (const grab of grabRows) {
      if (usedGrab.has(grab.id)) continue;

      const sameDate = normalizeDate(pos.orddate) === normalizeDate(grab.created_on);
      const sameAmount = Number(pos.grschrg) === Number(grab.amount);

      if (sameDate && sameAmount) {
        const variance = 0; // fully matches amount
        matches.push({ posId: pos.id, grabId: grab.id, variance, status: "id_mismatch" });
        usedGrab.add(grab.id);
        break;
      }
    }
  }

  return matches;
}
