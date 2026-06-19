/**
 * Server-side invoice billing KPI aggregates — status rollups, paid-in-period, extended KPIs.
 * Shared by GET /api/invoices/billing-totals (viewer / org / doctor scopes).
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  INVOICE_STATUS_KEYS,
  computeInvoiceExtendedKpis,
  emptyInvoiceBillingStatusTotals,
  rollupInvoiceBillingTotals,
  type InvoiceBillingStatusTotals,
  type InvoiceBillingTotals,
  type InvoiceBillingTotalsPayload,
  type InvoiceExtendedKpis,
  type InvoiceStatusKey,
} from "@/lib/invoice-billing-totals";
import {
  buildInsightsPaidCollectedWhere,
} from "@/lib/insights/insights-paid-collected";
import {
  resolveDateRangeInclusive,
  resolvePreviousDateRange,
} from "@/lib/insights/insights-period";
import type { InvoicePaidPeriodComparison } from "@/lib/invoice-paid-period";

const EMPTY_TOTALS: InvoiceBillingTotals = {
  paid: { cents: 0, count: 0 },
  outstanding: { cents: 0, count: 0 },
  refunded: { cents: 0, count: 0 },
  cancelled: { cents: 0, count: 0 },
};

function aggregateToBucket(agg: {
  _sum: { amount: number | null };
  _count: number;
}): { cents: number; count: number } {
  return { cents: agg._sum.amount ?? 0, count: agg._count };
}

async function aggregateStatusTotals(
  where: Prisma.InvoiceWhereInput
): Promise<{ totals: InvoiceBillingTotals; statusTotals: InvoiceBillingStatusTotals }> {
  const statusAggs = await Promise.all(
    INVOICE_STATUS_KEYS.map(async (status: InvoiceStatusKey) => {
      const agg = await prisma.invoice.aggregate({
        where: { ...where, status },
        _sum: { amount: true },
        _count: true,
      });
      return [status, aggregateToBucket(agg)] as const;
    })
  );

  const statusTotals = Object.fromEntries(statusAggs) as InvoiceBillingStatusTotals;
  const totals = rollupInvoiceBillingTotals(statusTotals);
  return { totals, statusTotals };
}

/** Paid revenue for calendar month vs prior month — same paid_at fallback as insights. */
export async function fetchInvoicePaidPeriodForWhere(
  where: Prisma.InvoiceWhereInput,
  now = new Date()
): Promise<InvoicePaidPeriodComparison> {
  const current = resolveDateRangeInclusive("month", now);
  const prev = resolvePreviousDateRange("month", now);

  const [currentAgg, prevAgg] = await Promise.all([
    prisma.invoice.aggregate({
      where: buildInsightsPaidCollectedWhere(where, {
        gte: current.start,
        lte: current.end,
      }),
      _sum: { amount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: buildInsightsPaidCollectedWhere(where, {
        gte: prev.start,
        lte: prev.end,
      }),
      _sum: { amount: true },
    }),
  ]);

  return {
    paidInPeriodCents: currentAgg._sum.amount ?? 0,
    paidInPeriodCount: currentAgg._count,
    paidPrevPeriodCents: prevAgg._sum.amount ?? 0,
  };
}

/** Volume, average, payment success — minimal select for scoped billing KPI row. */
export async function fetchInvoiceExtendedKpisForWhere(
  where: Prisma.InvoiceWhereInput
): Promise<InvoiceExtendedKpis> {
  const rows = await prisma.invoice.findMany({
    where,
    select: {
      amount: true,
      payments: { select: { status: true } },
    },
  });

  return computeInvoiceExtendedKpis(
    rows.map((row) => ({
      amount: row.amount,
      status: "paid" as const,
      payments: row.payments.map((p) => ({
        id: "",
        amount: 0,
        created_at: "",
        status: p.status,
      })),
    }))
  );
}

/** CP billing-totals — status rollups only (extended KPIs derived client-side from list). */
export async function fetchInvoiceBillingStatusPayloadForWhere(
  where: Prisma.InvoiceWhereInput
): Promise<InvoiceBillingTotalsPayload> {
  const activeWhere: Prisma.InvoiceWhereInput = { AND: [where, { deleted_at: null }] };
  const statusPayload = await aggregateStatusTotals(activeWhere);
  return {
    totals: statusPayload.totals,
    statusTotals: statusPayload.statusTotals,
  };
}

/** Full billing KPI payload — insights / legacy callers (period + extended server aggregates). */
export async function fetchInvoiceBillingKpiPayloadForWhere(
  where: Prisma.InvoiceWhereInput
): Promise<InvoiceBillingTotalsPayload> {
  const activeWhere: Prisma.InvoiceWhereInput = { AND: [where, { deleted_at: null }] };
  const [statusPayload, paidPeriod, extendedKpis] = await Promise.all([
    aggregateStatusTotals(activeWhere),
    fetchInvoicePaidPeriodForWhere(activeWhere),
    fetchInvoiceExtendedKpisForWhere(activeWhere),
  ]);

  return {
    totals: statusPayload.totals,
    statusTotals: statusPayload.statusTotals,
    paidPeriod,
    extendedKpis,
  };
}

/** Empty CP billing totals when viewer RBAC yields no invoices. */
export function emptyInvoiceBillingStatusPayload(): InvoiceBillingTotalsPayload {
  return {
    totals: EMPTY_TOTALS,
    statusTotals: emptyInvoiceBillingStatusTotals(),
  };
}

/** @deprecated CP uses emptyInvoiceBillingStatusPayload — kept for tests/legacy imports. */
export function emptyInvoiceBillingKpiPayload(): InvoiceBillingTotalsPayload {
  return emptyInvoiceBillingStatusPayload();
}
