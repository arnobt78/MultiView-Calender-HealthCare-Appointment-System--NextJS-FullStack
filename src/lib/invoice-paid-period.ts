/**
 * Client-side paid-in-period comparison — same paid_at + created_at fallback as insights aggregates.
 * Used on CP invoice-management / org billing (calendar month vs prior month).
 */

import {
  isInsightsPeriodAll,
  resolveDateRangeInclusive,
  resolvePreviousDateRange,
  type InsightsPeriod,
} from "@/lib/insights/insights-period";

type InvoicePaidRow = {
  amount: number;
  status: string;
  paid_at?: string | null;
  created_at: string;
};

function parsePaidAt(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function invoicePaidCollectedInRange(
  inv: InvoicePaidRow,
  start: Date,
  end: Date
): boolean {
  if (inv.status !== "paid") return false;
  const paidAt = parsePaidAt(inv.paid_at);
  if (paidAt) return paidAt >= start && paidAt <= end;
  const created = new Date(inv.created_at);
  return created >= start && created <= end;
}

export type InvoicePaidPeriodComparison = {
  paidInPeriodCents: number;
  paidInPeriodCount: number;
  paidPrevPeriodCents: number;
};

/** Sum paid revenue for current period and the immediately prior period of equal length. */
export function computeInvoicePaidPeriodComparison(
  invoices: ReadonlyArray<InvoicePaidRow>,
  period: InsightsPeriod = "month",
  now = new Date()
): InvoicePaidPeriodComparison {
  if (isInsightsPeriodAll(period)) {
    let cents = 0;
    let count = 0;
    for (const inv of invoices) {
      if (inv.status !== "paid") continue;
      cents += inv.amount;
      count += 1;
    }
    return { paidInPeriodCents: cents, paidInPeriodCount: count, paidPrevPeriodCents: 0 };
  }

  const current = resolveDateRangeInclusive(period, now);
  const prev = resolvePreviousDateRange(period, now);

  let paidInPeriodCents = 0;
  let paidInPeriodCount = 0;
  let paidPrevPeriodCents = 0;

  for (const inv of invoices) {
    if (invoicePaidCollectedInRange(inv, current.start, current.end)) {
      paidInPeriodCents += inv.amount;
      paidInPeriodCount += 1;
    } else if (invoicePaidCollectedInRange(inv, prev.start, prev.end)) {
      paidPrevPeriodCents += inv.amount;
    }
  }

  return { paidInPeriodCents, paidInPeriodCount, paidPrevPeriodCents };
}
