"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";
import { AnalyticsChartPlotShell } from "@/components/shared/analytics/AnalyticsChartPlotShell";
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

export type AnalyticsLinePoint = { label: string; count: number };

function buildCountChartConfig(emptyKind?: AnalyticsChartEmptyKind): ChartConfig {
  return {
    count: {
      label: getAnalyticsChartValueSeriesLabel(emptyKind),
      color: analyticsChartConfigColor(1),
    },
  };
}

const LineChartInner = dynamic(
  () => import("./AnalyticsLineChartInner").then((m) => m.AnalyticsLineChartInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[220px] w-full rounded-xl" />,
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
    return <Skeleton className="h-[220px] w-full rounded-xl" />;
  }

  const empty = isAnalyticsCountSeriesEmpty(data);
  const emptyCopy = empty && emptyKind ? getAnalyticsChartEmptyCopy(emptyKind) : undefined;
  const displayData =
    empty && emptyKind && period
      ? (buildAnalyticsPlaceholderAxisData(emptyKind, period) as AnalyticsLinePoint[])
      : data;

  const xAxisLayout = resolveAnalyticsChartXAxisLayout(emptyKind, "label");

  return (
    <AnalyticsChartPlotShell
      empty={empty}
      emptyCopy={emptyCopy}
      chartHeightClass={resolveAnalyticsChartPlotHeightClass(xAxisLayout)}
    >
      <LineChartInner
        data={displayData}
        config={buildCountChartConfig(emptyKind)}
        xAxisLayout={xAxisLayout}
      />
    </AnalyticsChartPlotShell>
  );
}
