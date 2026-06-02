/**
 * Shared value formatting for /insights KPI cards.
 * Keeps overview and revenue strips visually consistent with CP invoice tables.
 */

import { formatInvoiceMoney } from "@/lib/crud-notify-messages";

/** Format cents for KPI tiles — exact amount with fraction (de-DE, EUR default). */
export function formatBillingKpiMoney(
  cents: number,
  currency: string = "eur"
): string {
  return formatInvoiceMoney({ amount: cents, currency, unit: "cents" });
}

/** @deprecated Use formatBillingKpiMoney — kept for call-site stability. */
export function formatInsightsUsdFromCents(cents: number): string {
  return formatBillingKpiMoney(cents);
}

/** Format a percent-like numeric value as a whole percent (e.g. 25 -> "25%"). */
export function formatInsightsPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Period-over-period % change (current vs prior paid collected). */
export function formatInsightsRevenueDeltaBadge(
  currentCents: number,
  prevCents: number
): { text: string; positive: boolean } | null {
  if (prevCents === 0 && currentCents === 0) return null;
  if (prevCents === 0) return { text: "New", positive: true };
  const pct = Math.round(((currentCents - prevCents) / prevCents) * 100);
  return { text: `${pct > 0 ? "+" : ""}${pct}%`, positive: pct >= 0 };
}

/** Copy + delta for the vs-previous KPI card (insights + CP month comparison). */
export function formatInsightsRevenuePeriodComparison(
  currentCents: number,
  prevCents: number
): {
  delta: { text: string; positive: boolean } | null;
  deltaCents: number;
  subtitle: string;
} {
  const deltaCents = currentCents - prevCents;
  if (prevCents === 0 && currentCents === 0) {
    return {
      delta: null,
      deltaCents: 0,
      subtitle: "No paid revenue in this period or the prior one",
    };
  }
  if (prevCents === 0) {
    return {
      delta: { text: "New", positive: true },
      deltaCents,
      subtitle: `This period ${formatBillingKpiMoney(currentCents)} · No prior revenue`,
    };
  }
  const delta = formatInsightsRevenueDeltaBadge(currentCents, prevCents);
  return {
    delta,
    deltaCents,
    subtitle: `This period ${formatBillingKpiMoney(currentCents)} · Prior ${formatBillingKpiMoney(prevCents)}`,
  };
}
