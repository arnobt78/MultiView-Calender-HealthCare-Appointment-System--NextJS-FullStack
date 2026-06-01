/**
 * Client + server shared invoice KPI buckets — mirrors dashboard `fetchRevenueOverviewForViewer`
 * outstanding filter (`draft` | `sent` | `overdue` only; excludes refunded/cancelled).
 *
 * Demo curated seed (6 invoices): paid €175 (85+90), outstanding €187.50 (92.50+95),
 * refunded €100, cancelled €97.50.
 */

import type { InvoiceRow } from "@/lib/billing-types";

/** Statuses counted as "awaiting payment" on CP dashboard + overview KPIs. */
export const INVOICE_OUTSTANDING_STATUSES = ["draft", "sent", "overdue"] as const;

export type InvoiceBillingBucket = {
  cents: number;
  count: number;
};

export type InvoiceBillingTotals = {
  paid: InvoiceBillingBucket;
  outstanding: InvoiceBillingBucket;
  refunded: InvoiceBillingBucket;
  cancelled: InvoiceBillingBucket;
};

const EMPTY_BUCKET: InvoiceBillingBucket = { cents: 0, count: 0 };

function addToBucket(bucket: InvoiceBillingBucket, amount: number): void {
  bucket.cents += amount;
  bucket.count += 1;
}

/** Sum invoice rows into paid / outstanding / refunded / cancelled buckets (amounts in cents). */
export function computeInvoiceBillingTotals(
  invoices: ReadonlyArray<Pick<InvoiceRow, "amount" | "status">>
): InvoiceBillingTotals {
  const totals: InvoiceBillingTotals = {
    paid: { ...EMPTY_BUCKET },
    outstanding: { ...EMPTY_BUCKET },
    refunded: { ...EMPTY_BUCKET },
    cancelled: { ...EMPTY_BUCKET },
  };

  const outstandingSet = new Set<string>(INVOICE_OUTSTANDING_STATUSES);

  for (const inv of invoices) {
    const status = inv.status;
    if (status === "paid") {
      addToBucket(totals.paid, inv.amount);
    } else if (status === "refunded") {
      addToBucket(totals.refunded, inv.amount);
    } else if (status === "cancelled") {
      addToBucket(totals.cancelled, inv.amount);
    } else if (outstandingSet.has(status)) {
      addToBucket(totals.outstanding, inv.amount);
    }
  }

  return totals;
}
