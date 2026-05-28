"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";
import { AnalyticsChartPlotShell } from "@/components/shared/analytics/AnalyticsChartPlotShell";
import type { AnalyticsAreaPoint } from "@/components/shared/analytics/AnalyticsAreaChartInner";
import { analyticsChartConfigColor } from "@/components/shared/analytics/analytics-chart-classes";
import type { AnalyticsChartEmptyKind } from "@/lib/analytics-chart-empty";
import {
  resolveAnalyticsChartPlotHeightClass,
  resolveAnalyticsChartXAxisLayout,
} from "@/lib/analytics-chart-interaction";
import {
  buildAnalyticsPlaceholderAxisData,
  getAnalyticsChartEmptyCopy,
  getAnalyticsChartValueSeriesLabel,
  isAnalyticsCountSeriesEmpty,
} from "@/lib/analytics-chart-empty";
import type { InsightsPeriod } from "@/lib/insights/insights-period";

function buildCountChartConfig(emptyKind?: AnalyticsChartEmptyKind): ChartConfig {
  return {
    count: {
      label: getAnalyticsChartValueSeriesLabel(emptyKind ?? "paid-revenue"),
      color: analyticsChartConfigColor(4),
    },
  };
}

const AreaChartInner = dynamic(
  () => import("./AnalyticsAreaChartInner").then((m) => m.AnalyticsAreaChartInner),
  { ssr: false, loading: () => <Skeleton className="h-[220px] w-full rounded-xl" /> }
);

type Props = {
  data: AnalyticsAreaPoint[];
  loading?: boolean;
  emptyKind?: AnalyticsChartEmptyKind;
  period?: InsightsPeriod;
};

export function AnalyticsAreaChart({ data, loading, emptyKind, period }: Props) {
  if (loading) return <Skeleton className="h-[220px] w-full rounded-xl" />;

  const empty = isAnalyticsCountSeriesEmpty(data);
  const emptyCopy = empty && emptyKind ? getAnalyticsChartEmptyCopy(emptyKind) : undefined;
  const displayData =
    empty && emptyKind && period
      ? (buildAnalyticsPlaceholderAxisData(emptyKind, period) as AnalyticsAreaPoint[])
      : data;

  const xAxisLayout = resolveAnalyticsChartXAxisLayout(emptyKind, "label");

  return (
    <AnalyticsChartPlotShell
      empty={empty}
      emptyCopy={emptyCopy}
      chartHeightClass={resolveAnalyticsChartPlotHeightClass(xAxisLayout)}
    >
      <AreaChartInner
        data={displayData}
        config={buildCountChartConfig(emptyKind)}
        xAxisLayout={xAxisLayout}
      />
    </AnalyticsChartPlotShell>
  );
}
