/**
 * Shared value formatting for /insights KPI cards.
 * Keeps overview and revenue strips visually consistent.
 */

/** Format cents as whole-dollar USD display (e.g. 12345 -> "$123"). */
export function formatInsightsUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Format a percent-like numeric value as a whole percent (e.g. 25 -> "25%"). */
export function formatInsightsPercent(value: number): string {
  return `${Math.round(value)}%`;
}

