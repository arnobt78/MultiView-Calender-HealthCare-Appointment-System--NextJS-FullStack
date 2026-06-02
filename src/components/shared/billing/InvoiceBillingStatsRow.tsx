"use client";

import { InvoiceRevenueKpiGrid } from "@/components/shared/billing/InvoiceRevenueKpiGrid";
import {
  computeInvoiceBillingStatusTotals,
  computeInvoiceBillingTotals,
  computeInvoiceExtendedKpis,
  type InvoiceBillingStatusTotals,
  type InvoiceBillingTotals,
} from "@/lib/invoice-billing-totals";
import { formatInsightsPeriodStatValueLabel } from "@/lib/insights/insights-period-label";
import { computeInvoicePaidPeriodComparison } from "@/lib/invoice-paid-period";
import type { InvoiceRow } from "@/lib/billing-types";

type Props = {
  invoices: ReadonlyArray<
    Pick<InvoiceRow, "amount" | "status" | "paid_at" | "created_at" | "payments">
  >;
  totals?: InvoiceBillingTotals;
  statusTotals?: InvoiceBillingStatusTotals;
  valueSkeleton: boolean;
};

/** Glass KPI tiles — Invoice Management + org billing (incl. month vs prior month). */
export function InvoiceBillingStatsRow({
  invoices,
  totals: prefetchedTotals,
  statusTotals: prefetchedStatusTotals,
  valueSkeleton,
}: Props) {
  const statusTotals =
    prefetchedStatusTotals ?? computeInvoiceBillingStatusTotals(invoices);
  const totals = prefetchedTotals ?? computeInvoiceBillingTotals(invoices);
  const paidComparison = computeInvoicePaidPeriodComparison(invoices, "month");
  const extendedKpis = computeInvoiceExtendedKpis(invoices);
  const periodValueHint = formatInsightsPeriodStatValueLabel("month");

  return (
    <InvoiceRevenueKpiGrid
      mode="management"
      statusTotals={statusTotals}
      totals={totals}
      valueSkeleton={valueSkeleton}
      periodValueHint={periodValueHint}
      showPeriodComparison
      paidInPeriodCents={paidComparison.paidInPeriodCents}
      paidInPeriodCount={paidComparison.paidInPeriodCount}
      paidPrevPeriodCents={paidComparison.paidPrevPeriodCents}
      extendedKpis={extendedKpis}
    />
  );
}
