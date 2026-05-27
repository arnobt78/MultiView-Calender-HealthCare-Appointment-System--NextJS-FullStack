"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";
import { AnalyticsChartPlotShell } from "@/components/shared/analytics/AnalyticsChartPlotShell";
import type { AnalyticsBarPoint } from "@/components/shared/analytics/AnalyticsBarChartInner";
import { analyticsChartConfigColor } from "@/components/shared/analytics/analytics-chart-classes";
import type { AnalyticsChartEmptyKind } from "@/lib/analytics-chart-empty";
import {
  buildAnalyticsPlaceholderAxisData,
  getAnalyticsChartEmptyCopy,
  isAnalyticsCountSeriesEmpty,
} from "@/lib/analytics-chart-empty";
import type { InsightsPeriod } from "@/lib/insights/insights-period";

const chartConfig = {
  count: { label: "Count", color: analyticsChartConfigColor(2) },
} satisfies ChartConfig;

const BarChartInner = dynamic(
  () => import("./AnalyticsBarChartInner").then((m) => m.AnalyticsBarChartInner),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full rounded-xl" /> }
);

type Props = {
  data: AnalyticsBarPoint[];
  loading?: boolean;
  emptyKind?: AnalyticsChartEmptyKind;
  period?: InsightsPeriod;
};

export function AnalyticsBarChart({ data, loading, emptyKind, period }: Props) {
  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />;

  const empty = isAnalyticsCountSeriesEmpty(data);
  const emptyCopy = empty && emptyKind ? getAnalyticsChartEmptyCopy(emptyKind) : undefined;
  const displayData =
    empty && emptyKind && period
      ? (buildAnalyticsPlaceholderAxisData(emptyKind, period) as AnalyticsBarPoint[])
      : data;

  return (
    <AnalyticsChartPlotShell empty={empty} emptyCopy={emptyCopy}>
      <BarChartInner data={displayData} config={chartConfig} />
    </AnalyticsChartPlotShell>
  );
}
