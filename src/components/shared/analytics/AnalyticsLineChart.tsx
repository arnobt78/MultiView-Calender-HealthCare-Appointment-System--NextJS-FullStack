"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";
import { AnalyticsChartPlotShell } from "@/components/shared/analytics/AnalyticsChartPlotShell";
import { analyticsChartConfigColor } from "@/components/shared/analytics/analytics-chart-classes";
import type { AnalyticsChartEmptyKind } from "@/lib/analytics-chart-empty";
import {
  buildAnalyticsPlaceholderAxisData,
  getAnalyticsChartEmptyCopy,
  isAnalyticsCountSeriesEmpty,
} from "@/lib/analytics-chart-empty";
import type { InsightsPeriod } from "@/lib/insights/insights-period";

export type AnalyticsLinePoint = { label: string; count: number };

const chartConfig = {
  count: { label: "Count", color: analyticsChartConfigColor(1) },
} satisfies ChartConfig;

const LineChartInner = dynamic(
  () => import("./AnalyticsLineChartInner").then((m) => m.AnalyticsLineChartInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-40 w-full rounded-xl" />,
  }
);

type Props = {
  data: AnalyticsLinePoint[];
  loading?: boolean;
  emptyKind?: AnalyticsChartEmptyKind;
  period?: InsightsPeriod;
};

export function AnalyticsLineChart({ data, loading, emptyKind, period }: Props) {
  if (loading) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  const empty = isAnalyticsCountSeriesEmpty(data);
  const emptyCopy = empty && emptyKind ? getAnalyticsChartEmptyCopy(emptyKind) : undefined;
  const displayData =
    empty && emptyKind && period
      ? (buildAnalyticsPlaceholderAxisData(emptyKind, period) as AnalyticsLinePoint[])
      : data;

  return (
    <AnalyticsChartPlotShell empty={empty} emptyCopy={emptyCopy}>
      <LineChartInner data={displayData} config={chartConfig} />
    </AnalyticsChartPlotShell>
  );
}
