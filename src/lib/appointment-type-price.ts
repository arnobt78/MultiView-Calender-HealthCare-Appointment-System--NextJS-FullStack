/**
 * Visit-type price helpers — EUR input ↔ cents (owned + global appointment types).
 */

/** Form field / badge display — de-DE amount without currency symbol (icon adds €). */
export function formatCentsToPriceInput(cents: number): string {
  if (!Number.isFinite(cents) || cents <= 0) return "";
  return (cents / 100).toFixed(2);
}

/** Parse optional EUR text from forms; invalid/empty → 0 cents. */
export function parsePriceEurInputToCents(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const parsed = Number.parseFloat(trimmed.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

/** Badge label next to Euro icon — avoids `formatInvoiceMoney` duplicating the symbol. */
export function formatVisitFeeAmountLabel(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
