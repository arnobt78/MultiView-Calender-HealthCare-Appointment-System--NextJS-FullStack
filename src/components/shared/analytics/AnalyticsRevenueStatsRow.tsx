"use client";

import { ArrowDown, ArrowUp, BadgeDollarSign, FileWarning, Receipt, TrendingUp } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import type { InsightsPayload } from "@/lib/insights-data";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import { isInsightsPeriodAll } from "@/lib/insights/insights-period";
import { cn } from "@/lib/utils";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDelta(
  current: number,
  prev: number
): { text: string; positive: boolean } | null {
  if (prev === 0) return null;
  const pct = Math.round(((current - prev) / prev) * 100);
  return { text: `${pct > 0 ? "+" : ""}${pct}%`, positive: pct >= 0 };
}

type Props = {
  data: InsightsPayload | undefined;
  valueSkeleton: boolean;
  period: InsightsPeriod;
};

/** Revenue KPI tiles — paid in period, MoM delta, overdue/draft invoice counts. */
export function AnalyticsRevenueStatsRow({ data, valueSkeleton, period }: Props) {
  const paid = data?.v2?.revenue.paidInPeriod ?? data?.revenueThisMonth ?? 0;
  const prev = data?.v2?.revenue.paidPrevPeriod ?? data?.revenuePrevMonth ?? 0;
  const hideDelta = isInsightsPeriodAll(period);
  const delta = hideDelta ? null : formatDelta(paid, prev);
  const invoiceByStatus = data?.v2?.revenue.invoiceByStatus ?? {};
  const overdue = invoiceByStatus.overdue ?? 0;
  const draft = invoiceByStatus.draft ?? 0;

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <PatientStatCard
        variant="emerald"
        icon={BadgeDollarSign}
        title="Paid in period"
        subtitle="Collected revenue"
        value={0}
        valueDisplay={formatCents(paid)}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={delta ? (delta.positive ? ArrowUp : ArrowDown) : TrendingUp}
        title="vs previous period"
        subtitle={prev > 0 ? `Prior ${formatCents(prev)}` : "No prior revenue"}
        value={0}
        valueDisplay={
          delta ? (
            <span
              className={cn(
                "text-3xl font-semibold tabular-nums tracking-tight",
                delta.positive ? "text-emerald-700" : "text-red-600"
              )}
            >
              {delta.text}
            </span>
          ) : (
            "—"
          )
        }
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={FileWarning}
        title="Overdue invoices"
        subtitle="Needs follow-up"
        value={overdue}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={Receipt}
        title="Draft invoices"
        subtitle="Not yet sent"
        value={draft}
        valueSkeleton={valueSkeleton}
      />
    </div>
  );
}
