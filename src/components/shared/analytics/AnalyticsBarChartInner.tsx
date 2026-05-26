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
import { AnalyticsChartTooltip } from "@/components/shared/analytics/AnalyticsChartTooltip";
import { AnalyticsChartValueLabelList } from "@/components/shared/analytics/AnalyticsChartValueLabelList";
import { analyticsChartPlotMargin } from "@/lib/analytics-chart-interaction";

export type AnalyticsBarPoint = { label: string; count: number };

export function AnalyticsBarChartInner({
  data,
  config,
}: {
  data: AnalyticsBarPoint[];
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="h-40 min-h-[10rem] w-full">
      <BarChart data={data} margin={analyticsChartPlotMargin}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} />
        <YAxis tickLine={false} axisLine={false} fontSize={10} width={32} />
        <AnalyticsChartTooltip cursorVariant="bar" />
        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]}>
          <AnalyticsChartValueLabelList dataKey="count" position="top" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
