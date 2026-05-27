"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";
import { AnalyticsChartPlotShell } from "@/components/shared/analytics/AnalyticsChartPlotShell";
import type { AnalyticsAreaPoint } from "@/components/shared/analytics/AnalyticsAreaChartInner";
import { analyticsChartConfigColor } from "@/components/shared/analytics/analytics-chart-classes";
import type { AnalyticsChartEmptyKind } from "@/lib/analytics-chart-empty";
import {
  buildAnalyticsPlaceholderAxisData,
  getAnalyticsChartEmptyCopy,
  isAnalyticsCountSeriesEmpty,
} from "@/lib/analytics-chart-empty";
import type { InsightsPeriod } from "@/lib/insights/insights-period";

const chartConfig = {
  count: { label: "Revenue", color: analyticsChartConfigColor(4) },
} satisfies ChartConfig;

const AreaChartInner = dynamic(
  () => import("./AnalyticsAreaChartInner").then((m) => m.AnalyticsAreaChartInner),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full rounded-xl" /> }
);

type Props = {
  data: AnalyticsAreaPoint[];
  loading?: boolean;
  emptyKind?: AnalyticsChartEmptyKind;
  period?: InsightsPeriod;
};

export function AnalyticsAreaChart({ data, loading, emptyKind, period }: Props) {
  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />;

  const empty = isAnalyticsCountSeriesEmpty(data);
  const emptyCopy = empty && emptyKind ? getAnalyticsChartEmptyCopy(emptyKind) : undefined;
  const displayData =
    empty && emptyKind && period
      ? (buildAnalyticsPlaceholderAxisData(emptyKind, period) as AnalyticsAreaPoint[])
      : data;

  return (
    <AnalyticsChartPlotShell empty={empty} emptyCopy={emptyCopy}>
      <AreaChartInner data={displayData} config={chartConfig} />
    </AnalyticsChartPlotShell>
  );
}
