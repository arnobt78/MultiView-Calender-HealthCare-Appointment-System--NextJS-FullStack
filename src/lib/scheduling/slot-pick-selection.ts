/**
 * Edit-dialog slot chip selection — align appointment UTC start with availability grid cells.
 */

/** Normalize appointment `start` to UTC ISO for `selectedSlot` state. */
export function appointmentStartToSlotPickIso(start?: string | null): string | null {
  if (!start?.trim()) return null;
  const ms = Date.parse(start);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

/** Compare slot instants — avoids `.000Z` vs `Z` string mismatch. */
export function slotStartsMatch(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (!a || !b) return false;
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return false;
  return ta === tb;
}

/**
 * Map stored appointment start → grid `cell.start` when editing (snap to nearest cell within duration).
 */
export function resolveSlotPickIsoFromCells(
  appointmentStart: string | null | undefined,
  cells: readonly { start: string }[],
  slotDurationMinutes = 30
): string | null {
  const seed = appointmentStartToSlotPickIso(appointmentStart);
  if (!seed || cells.length === 0) return seed;

  const exact = cells.find((c) => slotStartsMatch(c.start, seed));
  if (exact) return exact.start;

  const t0 = Date.parse(seed);
  let best: string | null = null;
  let bestDelta = Infinity;
  for (const c of cells) {
    const t = Date.parse(c.start);
    if (Number.isNaN(t)) continue;
    const delta = Math.abs(t - t0);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = c.start;
    }
  }
  const maxSnapMs = Math.max(slotDurationMinutes, 15) * 60 * 1000;
  if (best && bestDelta <= maxSnapMs) return best;
  return seed;
}
