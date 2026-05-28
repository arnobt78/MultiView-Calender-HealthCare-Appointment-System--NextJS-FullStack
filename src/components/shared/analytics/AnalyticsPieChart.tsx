"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsChartPlotShell } from "@/components/shared/analytics/AnalyticsChartPlotShell";
import type { AnalyticsPiePoint } from "@/components/shared/analytics/AnalyticsPieChartInner";
import { buildPieChartConfigFromSlices } from "@/lib/analytics-chart-interaction";
import type { AnalyticsChartEmptyKind } from "@/lib/analytics-chart-empty";
import {
  getAnalyticsChartEmptyCopy,
  isAnalyticsCountSeriesEmpty,
} from "@/lib/analytics-chart-empty";
import type { InsightsPeriod } from "@/lib/insights/insights-period";

const PieChartInner = dynamic(
  () => import("./AnalyticsPieChartInner").then((m) => m.AnalyticsPieChartInner),
  { ssr: false, loading: () => <Skeleton className="h-48 w-full rounded-xl" /> }
);

type Props = {
  data: AnalyticsPiePoint[];
  loading?: boolean;
  emptyKind?: AnalyticsChartEmptyKind;
  /** Unused for pie placeholder (overlay-only) — kept for API parity with other charts. */
  period?: InsightsPeriod;
};

export function AnalyticsPieChart({ data, loading, emptyKind }: Props) {
  const empty = isAnalyticsCountSeriesEmpty(data);
  // Strip zero-count slices — 0° sectors create visual artifact (stray line at 3 o'clock).
  const displayData = useMemo(
    () => (empty ? [] : data.filter((d) => (d.count ?? 0) > 0)),
    [empty, data]
  );
  const chartConfig = useMemo(() => buildPieChartConfigFromSlices(displayData), [displayData]);
  const emptyCopy = empty && emptyKind ? getAnalyticsChartEmptyCopy(emptyKind) : undefined;

  if (loading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (empty && emptyKind) {
    return (
      <AnalyticsChartPlotShell
        empty
        emptyCopy={emptyCopy}
        chartHeightClass="h-48 min-h-[12rem]"
      >
        <div
          className="h-full w-full rounded-xl border border-border/40 bg-muted/10"
          aria-hidden
        />
      </AnalyticsChartPlotShell>
    );
  }

  return <PieChartInner data={displayData} config={chartConfig} />;
}
