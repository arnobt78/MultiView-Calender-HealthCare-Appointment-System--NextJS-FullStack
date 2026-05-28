"use client";

import dynamic from "next/dynamic";
import type { ChartConfig } from "@/components/ui/chart";
import { AnalyticsChartPlotShell } from "@/components/shared/analytics/AnalyticsChartPlotShell";
import type { AnalyticsBarPoint } from "@/components/shared/analytics/AnalyticsBarChartInner";
import { analyticsChartConfigColor } from "@/components/shared/analytics/analytics-chart-classes";
import type { AnalyticsChartEmptyKind } from "@/lib/analytics-chart-empty";
import {
  resolveAnalyticsChartPlotHeightClass,
  resolveAnalyticsChartXAxisLayout,
  type AnalyticsChartXAxisLayout,
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
      label: getAnalyticsChartValueSeriesLabel(emptyKind),
      color: analyticsChartConfigColor(2),
    },
  };
}

const BarChartInner = dynamic(
  () => import("./AnalyticsBarChartInner").then((m) => m.AnalyticsBarChartInner),
  {
    ssr: false,
    // Wrapper shell already owns loading UI; avoid a second dynamic skeleton layer.
    loading: () => null,
  }
);

type Props = {
  data: AnalyticsBarPoint[];
  loading?: boolean;
  emptyKind?: AnalyticsChartEmptyKind;
  period?: InsightsPeriod;
  /**
   * Override X-axis layout. Use "wrap" for charts whose labels are long dynamic strings
   * (category names, doctor names). Defaults to resolveAnalyticsChartXAxisLayout().
   */
  xAxisLayout?: AnalyticsChartXAxisLayout;
};

export function AnalyticsBarChart({ data, loading, emptyKind, period, xAxisLayout: layoutProp }: Props) {
  const empty = isAnalyticsCountSeriesEmpty(data);
  const showEmptyOverlay = !loading && empty;
  const emptyCopy = showEmptyOverlay && emptyKind ? getAnalyticsChartEmptyCopy(emptyKind) : undefined;
  const displayData =
    ((loading && emptyKind && period) || (empty && emptyKind && period))
      ? (buildAnalyticsPlaceholderAxisData(emptyKind, period) as AnalyticsBarPoint[])
      : data;

  // Use caller-provided layout override (e.g. "wrap" for long names) else fall back to default
  const xAxisLayout = layoutProp ?? resolveAnalyticsChartXAxisLayout(emptyKind, "label");

  return (
    <AnalyticsChartPlotShell
      // Keep chart shell mounted during loading so hard refreshes do not flash generic skeletons.
      empty={showEmptyOverlay}
      emptyCopy={emptyCopy}
      loading={Boolean(loading)}
      chartHeightClass={resolveAnalyticsChartPlotHeightClass(xAxisLayout)}
    >
      <BarChartInner
        data={displayData}
        config={buildCountChartConfig(emptyKind)}
        xAxisLayout={xAxisLayout}
      />
    </AnalyticsChartPlotShell>
  );
}
