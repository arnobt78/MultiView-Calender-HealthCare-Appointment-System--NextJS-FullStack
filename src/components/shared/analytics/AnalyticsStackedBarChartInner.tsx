"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  XAxis,
  YAxis,
  type ChartConfig,
} from "@/components/ui/chart";
import { AnalyticsChartEmptyOverlay } from "@/components/shared/analytics/AnalyticsChartEmptyOverlay";
import { AnalyticsChartTooltip } from "@/components/shared/analytics/AnalyticsChartTooltip";
import { AnalyticsChartValueLabelList } from "@/components/shared/analytics/AnalyticsChartValueLabelList";
import type { AnalyticsChartEmptyCopy } from "@/lib/analytics-chart-empty";
import { analyticsChartPlotMargin } from "@/lib/analytics-chart-interaction";

export type AnalyticsStackedBarPoint = {
  month: string;
  done: number;
  pending: number;
  alert: number;
};

const STACKED_LABEL_CLASS = "fill-white text-[9px] font-semibold drop-shadow-sm";

export function AnalyticsStackedBarChartInner({
  data,
  config,
  emptyCopy,
}: {
  data: AnalyticsStackedBarPoint[];
  config: ChartConfig;
  /** When set, centered overlay on plot only (legend stays visible below). */
  emptyCopy?: AnalyticsChartEmptyCopy;
}) {
  return (
    <div className="space-y-3">
      <div className="relative h-44 min-h-[11rem] w-full">
        <ChartContainer config={config} className="h-full w-full">
        <BarChart data={data} margin={analyticsChartPlotMargin}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />
          <YAxis tickLine={false} axisLine={false} fontSize={10} width={32} />
          <AnalyticsChartTooltip cursorVariant="bar" />
          <Bar dataKey="done" stackId="status" fill="var(--color-done)" radius={[0, 0, 0, 0]}>
            <AnalyticsChartValueLabelList
              dataKey="done"
              position="insideTop"
              className={STACKED_LABEL_CLASS}
            />
          </Bar>
          <Bar dataKey="pending" stackId="status" fill="var(--color-pending)">
            <AnalyticsChartValueLabelList
              dataKey="pending"
              position="insideTop"
              className={STACKED_LABEL_CLASS}
            />
          </Bar>
          <Bar dataKey="alert" stackId="status" fill="var(--color-alert)" radius={[4, 4, 0, 0]}>
            <AnalyticsChartValueLabelList
              dataKey="alert"
              position="insideTop"
              className={STACKED_LABEL_CLASS}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
        {emptyCopy ? <AnalyticsChartEmptyOverlay copy={emptyCopy} /> : null}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/80" />
          Done
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400/80" />
          Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400/70" />
          Alert
        </span>
      </div>
    </div>
  );
}
