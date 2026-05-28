"use client";

import dynamic from "next/dynamic";
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
  {
    ssr: false,
    // Inner chart now owns loading UI; avoid a second dynamic skeleton layer.
    loading: () => null,
  }
);

type Props = {
  data: AnalyticsStackedBarPoint[];
  loading?: boolean;
  emptyKind?: AnalyticsChartEmptyKind;
  period?: InsightsPeriod;
};

export function AnalyticsStackedBarChart({ data, loading, emptyKind, period }: Props) {
  const empty = isAnalyticsCountSeriesEmpty(data);
  const showEmptyOverlay = !loading && empty;
  const emptyCopy = showEmptyOverlay && emptyKind ? getAnalyticsChartEmptyCopy(emptyKind) : undefined;
  const displayData =
    ((loading && emptyKind && period) || (empty && emptyKind && period))
      ? (buildAnalyticsPlaceholderAxisData(
          emptyKind,
          period
        ) as AnalyticsStackedBarPoint[])
      : data;

  return (
    <StackedInner
      data={displayData}
      config={chartConfig}
      emptyCopy={emptyCopy}
      loading={Boolean(loading)}
    />
  );
}
