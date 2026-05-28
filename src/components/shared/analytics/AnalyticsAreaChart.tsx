"use client";

import dynamic from "next/dynamic";
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
  {
    ssr: false,
    // Wrapper shell already owns loading UI; avoid a second dynamic skeleton layer.
    loading: () => null,
  }
);

type Props = {
  data: AnalyticsAreaPoint[];
  loading?: boolean;
  emptyKind?: AnalyticsChartEmptyKind;
  period?: InsightsPeriod;
};

export function AnalyticsAreaChart({ data, loading, emptyKind, period }: Props) {
  const empty = isAnalyticsCountSeriesEmpty(data);
  const showEmptyOverlay = !loading && empty;
  const emptyCopy = showEmptyOverlay && emptyKind ? getAnalyticsChartEmptyCopy(emptyKind) : undefined;
  const displayData =
    ((loading && emptyKind && period) || (empty && emptyKind && period))
      ? (buildAnalyticsPlaceholderAxisData(emptyKind, period) as AnalyticsAreaPoint[])
      : data;

  const xAxisLayout = resolveAnalyticsChartXAxisLayout(emptyKind, "label");

  return (
    <AnalyticsChartPlotShell
      // Keep chart shell mounted to avoid replacing chart area with full skeleton.
      empty={showEmptyOverlay}
      emptyCopy={emptyCopy}
      loading={Boolean(loading)}
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
