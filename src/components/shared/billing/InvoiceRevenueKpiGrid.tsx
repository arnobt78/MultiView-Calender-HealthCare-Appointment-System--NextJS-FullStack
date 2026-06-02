"use client";

/**
 * Shared invoice revenue KPI grid — amount as primary value, count as title badge.
 * Insights: period hints + paid-in-period / vs-previous + extended payment KPIs.
 * CP: same cards using calendar-month paid comparison when invoice rows include paid_at.
 */

import {
  INVOICE_EXTRA_AVG_PRESET,
  INVOICE_EXTRA_PAYMENT_SUCCESS_PRESET,
  INVOICE_EXTRA_TOTAL_PRESET,
  INVOICE_INSIGHTS_PAID_IN_PERIOD_PRESET,
  INVOICE_INSIGHTS_VS_PREVIOUS_PRESET,
  INVOICE_ROLLUP_OUTSTANDING_PRESET,
  INVOICE_STATUS_KPI_PRESETS,
  invoiceKpiCountBadge,
} from "@/lib/invoice-revenue-kpi-presets";
import { ArrowDown, ArrowUp } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import {
  formatBillingKpiMoney,
  formatInsightsPercent,
  formatInsightsRevenuePeriodComparison,
} from "@/lib/insights/insights-kpi-format";
import { invoiceRevenueKpiGridClass } from "@/lib/insights-ui-classes";
import type { InvoiceExtendedKpis } from "@/lib/invoice-billing-totals";
import {
  INVOICE_OUTSTANDING_STATUSES,
  rollupInvoiceBillingTotals,
  type InvoiceBillingBucket,
  type InvoiceBillingStatusTotals,
  type InvoiceBillingTotals,
  type InvoiceStatusKey,
} from "@/lib/invoice-billing-totals";
type Props = {
  statusTotals: InvoiceBillingStatusTotals;
  totals?: InvoiceBillingTotals;
  valueSkeleton: boolean;
  periodValueHint?: string;
  mode?: "insights" | "management";
  paidInPeriodCents?: number;
  paidInPeriodCount?: number;
  paidPrevPeriodCents?: number;
  showPeriodComparison?: boolean;
  extendedKpis?: InvoiceExtendedKpis;
};

function sumOutstandingBucket(statusTotals: InvoiceBillingStatusTotals): InvoiceBillingBucket {
  const bucket: InvoiceBillingBucket = { cents: 0, count: 0 };
  for (const key of INVOICE_OUTSTANDING_STATUSES) {
    bucket.cents += statusTotals[key].cents;
    bucket.count += statusTotals[key].count;
  }
  return bucket;
}

function deltaToneClass(positive: boolean | undefined): string {
  if (positive === true) return "text-emerald-700";
  if (positive === false) return "text-red-600";
  return "text-gray-700";
}

function deltaBadgeToneClass(positive: boolean | undefined): string {
  if (positive === true) {
    return "border-emerald-300/80 bg-emerald-50 text-emerald-800";
  }
  if (positive === false) {
    return "border-red-300/80 bg-red-50 text-red-800";
  }
  return "";
}

/** Invoice KPI cards for insights + CP billing surfaces. */
export function InvoiceRevenueKpiGrid({
  statusTotals,
  totals: totalsProp,
  valueSkeleton,
  periodValueHint,
  mode = "management",
  paidInPeriodCents = 0,
  paidInPeriodCount = 0,
  paidPrevPeriodCents = 0,
  showPeriodComparison = true,
  extendedKpis,
}: Props) {
  const totals = totalsProp ?? rollupInvoiceBillingTotals(statusTotals);
  const outstandingBucket = sumOutstandingBucket(statusTotals);
  const hint = periodValueHint;
  const showPeriodCards =
    showPeriodComparison && (mode === "insights" || periodValueHint != null);

  const comparison = formatInsightsRevenuePeriodComparison(
    paidInPeriodCents,
    paidPrevPeriodCents
  );
  const delta = comparison.delta;

  const statusDetailKeys: InvoiceStatusKey[] = [
    "draft",
    "sent",
    "overdue",
    "refunded",
    "cancelled",
  ];

  return (
    <div className={invoiceRevenueKpiGridClass}>
      {showPeriodCards ? (
        <>
          <PatientStatCard
            variant={INVOICE_INSIGHTS_PAID_IN_PERIOD_PRESET.variant}
            icon={INVOICE_INSIGHTS_PAID_IN_PERIOD_PRESET.icon}
            title={INVOICE_INSIGHTS_PAID_IN_PERIOD_PRESET.title}
            subtitle={INVOICE_INSIGHTS_PAID_IN_PERIOD_PRESET.subtitle}
            badge={invoiceKpiCountBadge(
              paidInPeriodCount,
              INVOICE_INSIGHTS_PAID_IN_PERIOD_PRESET.badgeLabel
            )}
            value={paidInPeriodCount}
            valueDisplay={formatBillingKpiMoney(paidInPeriodCents)}
            valueSkeleton={valueSkeleton}
            valueRowHint={hint}
          />
          <PatientStatCard
            variant={delta?.positive === false ? "rose" : delta?.positive === true ? "emerald" : "sky"}
            icon={delta ? (delta.positive ? ArrowUp : ArrowDown) : INVOICE_INSIGHTS_VS_PREVIOUS_PRESET.icon}
            title={INVOICE_INSIGHTS_VS_PREVIOUS_PRESET.title}
            subtitle={comparison.subtitle}
            badge={delta?.text}
            badgeClassName={delta ? deltaBadgeToneClass(delta.positive) : undefined}
            value={0}
            valueDisplay={
              delta?.text ?? (
                <span className="text-2xl text-muted-foreground">—</span>
              )
            }
            valueClassName={delta ? deltaToneClass(delta.positive) : undefined}
            valueSkeleton={valueSkeleton}
            valueRowHint={hint}
          />
        </>
      ) : null}

      <PatientStatCard
        variant={INVOICE_STATUS_KPI_PRESETS.paid.variant}
        icon={INVOICE_STATUS_KPI_PRESETS.paid.icon}
        title={INVOICE_STATUS_KPI_PRESETS.paid.title}
        subtitle={INVOICE_STATUS_KPI_PRESETS.paid.subtitle}
        badge={invoiceKpiCountBadge(statusTotals.paid.count, INVOICE_STATUS_KPI_PRESETS.paid.badgeLabel)}
        value={statusTotals.paid.count}
        valueDisplay={formatBillingKpiMoney(statusTotals.paid.cents)}
        valueSkeleton={valueSkeleton}
        valueRowHint={mode === "insights" ? hint : undefined}
      />

      <PatientStatCard
        variant={INVOICE_ROLLUP_OUTSTANDING_PRESET.variant}
        icon={INVOICE_ROLLUP_OUTSTANDING_PRESET.icon}
        title={INVOICE_ROLLUP_OUTSTANDING_PRESET.title}
        subtitle={INVOICE_ROLLUP_OUTSTANDING_PRESET.subtitle}
        badge={invoiceKpiCountBadge(outstandingBucket.count, INVOICE_ROLLUP_OUTSTANDING_PRESET.badgeLabel)}
        value={outstandingBucket.count}
        valueDisplay={formatBillingKpiMoney(outstandingBucket.cents)}
        valueSkeleton={valueSkeleton}
        valueRowHint={mode === "insights" ? hint : undefined}
      />

      {statusDetailKeys.map((key) => {
        const preset = INVOICE_STATUS_KPI_PRESETS[key];
        const bucket = statusTotals[key];
        return (
          <PatientStatCard
            key={preset.id}
            variant={preset.variant}
            icon={preset.icon}
            title={preset.title}
            subtitle={preset.subtitle}
            badge={invoiceKpiCountBadge(bucket.count, preset.badgeLabel)}
            value={bucket.count}
            valueDisplay={formatBillingKpiMoney(bucket.cents)}
            valueSkeleton={valueSkeleton}
            valueRowHint={mode === "insights" ? hint : undefined}
          />
        );
      })}

      {extendedKpis ? (
        <>
          <PatientStatCard
            variant={INVOICE_EXTRA_TOTAL_PRESET.variant}
            icon={INVOICE_EXTRA_TOTAL_PRESET.icon}
            title={INVOICE_EXTRA_TOTAL_PRESET.title}
            subtitle={INVOICE_EXTRA_TOTAL_PRESET.subtitle}
            badge={invoiceKpiCountBadge(
              extendedKpis.totalCount,
              INVOICE_EXTRA_TOTAL_PRESET.badgeLabel
            )}
            value={extendedKpis.totalCount}
            valueDisplay={formatBillingKpiMoney(extendedKpis.totalAmountCents)}
            valueSkeleton={valueSkeleton}
            valueRowHint={mode === "insights" ? hint : undefined}
          />
          <PatientStatCard
            variant={INVOICE_EXTRA_AVG_PRESET.variant}
            icon={INVOICE_EXTRA_AVG_PRESET.icon}
            title={INVOICE_EXTRA_AVG_PRESET.title}
            subtitle={INVOICE_EXTRA_AVG_PRESET.subtitle}
            badge={invoiceKpiCountBadge(
              extendedKpis.totalCount,
              INVOICE_EXTRA_AVG_PRESET.badgeLabel
            )}
            value={extendedKpis.totalCount}
            valueDisplay={formatBillingKpiMoney(extendedKpis.avgInvoiceCents)}
            valueSkeleton={valueSkeleton}
            valueRowHint={mode === "insights" ? hint : undefined}
          />
          <PatientStatCard
            variant={INVOICE_EXTRA_PAYMENT_SUCCESS_PRESET.variant}
            icon={INVOICE_EXTRA_PAYMENT_SUCCESS_PRESET.icon}
            title={INVOICE_EXTRA_PAYMENT_SUCCESS_PRESET.title}
            subtitle={INVOICE_EXTRA_PAYMENT_SUCCESS_PRESET.subtitle}
            badge={
              extendedKpis.paymentAttemptCount > 0
                ? `${extendedKpis.paymentAttemptCount} attempts`
                : undefined
            }
            value={0}
            valueDisplay={formatInsightsPercent(extendedKpis.paymentSuccessPct)}
            valueSkeleton={valueSkeleton}
            valueRowHint={mode === "insights" ? hint : undefined}
          />
        </>
      ) : null}
    </div>
  );
}
