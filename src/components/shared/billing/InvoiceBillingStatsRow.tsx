"use client";

import { InvoiceRevenueKpiGrid } from "@/components/shared/billing/InvoiceRevenueKpiGrid";
import {
  computeInvoiceBillingStatusTotals,
  computeInvoiceBillingTotals,
  computeInvoiceExtendedKpis,
  type InvoiceBillingStatusTotals,
  type InvoiceBillingTotals,
} from "@/lib/invoice-billing-totals";
import type { InvoiceRow } from "@/lib/billing-types";

type Props = {
  invoices: ReadonlyArray<
    Pick<InvoiceRow, "amount" | "status" | "paid_at" | "created_at" | "payments">
  >;
  totals?: InvoiceBillingTotals;
  statusTotals?: InvoiceBillingStatusTotals;
  valueSkeleton: boolean;
};

/** Glass KPI tiles — CP invoice hub + org billing (all-time scoped, count footers). */
export function InvoiceBillingStatsRow({
  invoices,
  totals: prefetchedTotals,
  statusTotals: prefetchedStatusTotals,
  valueSkeleton,
}: Props) {
  const statusTotals =
    prefetchedStatusTotals ?? computeInvoiceBillingStatusTotals(invoices);
  const totals = prefetchedTotals ?? computeInvoiceBillingTotals(invoices);
  const extendedKpis = computeInvoiceExtendedKpis(invoices);

  return (
    <InvoiceRevenueKpiGrid
      mode="management"
      statusTotals={statusTotals}
      totals={totals}
      valueSkeleton={valueSkeleton}
      showPeriodComparison={false}
      extendedKpis={extendedKpis}
    />
  );
}
