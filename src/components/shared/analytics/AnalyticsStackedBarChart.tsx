"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";
import type { AnalyticsStackedBarPoint } from "@/components/shared/analytics/AnalyticsStackedBarChartInner";
import type { AnalyticsChartEmptyKind } from "@/lib/analytics-chart-empty";
import {
  buildAnalyticsPlaceholderAxisData,
  getAnalyticsChartEmptyCopy,
  isAnalyticsCountSeriesEmpty,
} from "@/lib/analytics-chart-empty";
import type { InsightsPeriod } from "@/lib/insights/insights-period";

const chartConfig = {
  done: { label: "Done", color: "hsl(142 71% 45%)" },
  pending: { label: "Pending", color: "hsl(38 92% 50%)" },
  alert: { label: "Alert", color: "hsl(0 84% 60%)" },
} satisfies ChartConfig;

const StackedInner = dynamic(
  () =>
    import("./AnalyticsStackedBarChartInner").then((m) => m.AnalyticsStackedBarChartInner),
  { ssr: false, loading: () => <Skeleton className="h-44 w-full rounded-xl" /> }
);

type Props = {
  data: AnalyticsStackedBarPoint[];
  loading?: boolean;
  emptyKind?: AnalyticsChartEmptyKind;
  period?: InsightsPeriod;
};

export function AnalyticsStackedBarChart({ data, loading, emptyKind, period }: Props) {
  if (loading) return <Skeleton className="h-44 w-full rounded-xl" />;

  const empty = isAnalyticsCountSeriesEmpty(data);
  const emptyCopy = empty && emptyKind ? getAnalyticsChartEmptyCopy(emptyKind) : undefined;
  const displayData =
    empty && emptyKind && period
      ? (buildAnalyticsPlaceholderAxisData(
          emptyKind,
          period
        ) as AnalyticsStackedBarPoint[])
      : data;

  return (
    <StackedInner data={displayData} config={chartConfig} emptyCopy={emptyCopy} />
  );
}
