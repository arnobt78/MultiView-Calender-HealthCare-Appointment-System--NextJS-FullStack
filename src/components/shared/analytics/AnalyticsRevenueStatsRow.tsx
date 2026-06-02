"use client";

import { InvoiceRevenueKpiGrid } from "@/components/shared/billing/InvoiceRevenueKpiGrid";
import type { InsightsPayload } from "@/lib/insights-data";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import { isInsightsPeriodAll } from "@/lib/insights/insights-period";
import { formatInsightsPeriodStatValueLabel } from "@/lib/insights/insights-period-label";
import {
  emptyInvoiceBillingStatusTotals,
  type InvoiceExtendedKpis,
  type InvoiceStatusKey,
} from "@/lib/invoice-billing-totals";

type Props = {
  data: InsightsPayload | undefined;
  valueSkeleton: boolean;
  period: InsightsPeriod;
};

/** Revenue KPI strip for /insights — period-filtered amounts + status breakdown. */
export function AnalyticsRevenueStatsRow({ data, valueSkeleton, period }: Props) {
  const revenue = data?.v2?.revenue;
  const paidInPeriod = revenue?.paidInPeriod ?? data?.revenueThisMonth ?? 0;
  const paidPrev = revenue?.paidPrevPeriod ?? data?.revenuePrevMonth ?? 0;
  const statusTotals = revenue?.statusTotals ?? emptyInvoiceBillingStatusTotals();
  const periodValueHint = formatInsightsPeriodStatValueLabel(period);

  const totalCount = Object.values(revenue?.invoiceByStatus ?? {}).reduce(
    (sum, n) => sum + n,
    0
  );
  const totalAmountCents = (Object.keys(statusTotals) as InvoiceStatusKey[]).reduce(
    (sum, key) => sum + statusTotals[key].cents,
    0
  );
  const extendedKpis: InvoiceExtendedKpis = {
    totalCount,
    totalAmountCents,
    avgInvoiceCents: revenue?.avgInvoiceCents ?? 0,
    paymentSuccessPct: revenue?.paymentSuccessPct ?? 0,
    paymentAttemptCount: 0,
  };

  return (
    <div className="mb-6">
    <InvoiceRevenueKpiGrid
      mode="insights"
      statusTotals={statusTotals}
      valueSkeleton={valueSkeleton}
      periodValueHint={periodValueHint}
      paidInPeriodCents={paidInPeriod}
      paidInPeriodCount={revenue?.paidInPeriodCount ?? 0}
      paidPrevPeriodCents={paidPrev}
      showPeriodComparison={!isInsightsPeriodAll(period)}
      extendedKpis={extendedKpis}
    />
    </div>
  );
}
