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

/** Per-status keys for detailed KPI cards (insights + CP billing). */
export const INVOICE_STATUS_KEYS = [
  "paid",
  "draft",
  "sent",
  "overdue",
  "refunded",
  "cancelled",
] as const;

export type InvoiceStatusKey = (typeof INVOICE_STATUS_KEYS)[number];

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

/** Amount + count per invoice status — source for rollups and detail cards. */
export type InvoiceBillingStatusTotals = Record<InvoiceStatusKey, InvoiceBillingBucket>;

export type InvoiceBillingTotalsPayload = {
  totals: InvoiceBillingTotals;
  statusTotals: InvoiceBillingStatusTotals;
};

const EMPTY_BUCKET: InvoiceBillingBucket = { cents: 0, count: 0 };

export function emptyInvoiceBillingStatusTotals(): InvoiceBillingStatusTotals {
  return {
    paid: { ...EMPTY_BUCKET },
    draft: { ...EMPTY_BUCKET },
    sent: { ...EMPTY_BUCKET },
    overdue: { ...EMPTY_BUCKET },
    refunded: { ...EMPTY_BUCKET },
    cancelled: { ...EMPTY_BUCKET },
  };
}

function addToBucket(bucket: InvoiceBillingBucket, amount: number): void {
  bucket.cents += amount;
  bucket.count += 1;
}

function isInvoiceStatusKey(status: string): status is InvoiceStatusKey {
  return (INVOICE_STATUS_KEYS as readonly string[]).includes(status);
}

/** Map Prisma groupBy rows into per-status buckets. */
export function buildInvoiceStatusTotalsFromGroupBy(
  rows: ReadonlyArray<{
    status: string;
    _count: { _all: number };
    _sum: { amount: number | null };
  }>
): InvoiceBillingStatusTotals {
  const statusTotals = emptyInvoiceBillingStatusTotals();
  for (const row of rows) {
    if (!isInvoiceStatusKey(row.status)) continue;
    statusTotals[row.status] = {
      cents: row._sum.amount ?? 0,
      count: row._count._all,
    };
  }
  return statusTotals;
}

/** Derive rollup buckets from per-status totals. */
export function rollupInvoiceBillingTotals(
  statusTotals: InvoiceBillingStatusTotals
): InvoiceBillingTotals {
  const outstanding: InvoiceBillingBucket = { cents: 0, count: 0 };
  for (const key of INVOICE_OUTSTANDING_STATUSES) {
    outstanding.cents += statusTotals[key].cents;
    outstanding.count += statusTotals[key].count;
  }
  return {
    paid: { ...statusTotals.paid },
    outstanding,
    refunded: { ...statusTotals.refunded },
    cancelled: { ...statusTotals.cancelled },
  };
}

/** Sum invoice rows into per-status buckets, then rollups. */
export function computeInvoiceBillingStatusTotals(
  invoices: ReadonlyArray<Pick<InvoiceRow, "amount" | "status">>
): InvoiceBillingStatusTotals {
  const statusTotals = emptyInvoiceBillingStatusTotals();

  for (const inv of invoices) {
    const status = inv.status;
    if (isInvoiceStatusKey(status)) {
      addToBucket(statusTotals[status], inv.amount);
    }
  }

  return statusTotals;
}

/** Sum invoice rows into paid / outstanding / refunded / cancelled buckets (amounts in cents). */
export function computeInvoiceBillingTotals(
  invoices: ReadonlyArray<Pick<InvoiceRow, "amount" | "status">>
): InvoiceBillingTotals {
  return rollupInvoiceBillingTotals(computeInvoiceBillingStatusTotals(invoices));
}

/** Status breakdown + rollup buckets — preferred for KPI grids. */
export function computeInvoiceBillingTotalsPayload(
  invoices: ReadonlyArray<Pick<InvoiceRow, "amount" | "status">>
): InvoiceBillingTotalsPayload {
  const statusTotals = computeInvoiceBillingStatusTotals(invoices);
  return {
    statusTotals,
    totals: rollupInvoiceBillingTotals(statusTotals),
  };
}

/** Extra list KPIs — total volume, average invoice, payment success (CP + insights). */
export type InvoiceExtendedKpis = {
  totalCount: number;
  totalAmountCents: number;
  avgInvoiceCents: number;
  paymentSuccessPct: number;
  paymentAttemptCount: number;
};

export function computeInvoiceExtendedKpis(
  invoices: ReadonlyArray<
    Pick<InvoiceRow, "amount" | "status" | "payments">
  >
): InvoiceExtendedKpis {
  let totalAmountCents = 0;
  let paymentAttemptCount = 0;
  let paymentSuccessCount = 0;

  for (const inv of invoices) {
    totalAmountCents += inv.amount;
    for (const payment of inv.payments ?? []) {
      paymentAttemptCount += 1;
      if (payment.status === "succeeded") paymentSuccessCount += 1;
    }
  }

  const totalCount = invoices.length;
  return {
    totalCount,
    totalAmountCents,
    avgInvoiceCents: totalCount > 0 ? Math.round(totalAmountCents / totalCount) : 0,
    paymentSuccessPct:
      paymentAttemptCount > 0
        ? Math.round((paymentSuccessCount / paymentAttemptCount) * 100)
        : 0,
    paymentAttemptCount,
  };
}
