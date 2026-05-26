"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ChartContainer,
  XAxis,
  YAxis,
  type ChartConfig,
} from "@/components/ui/chart";
import { AnalyticsChartTooltip } from "@/components/shared/analytics/AnalyticsChartTooltip";
import { AnalyticsChartValueLabelList } from "@/components/shared/analytics/AnalyticsChartValueLabelList";
import { analyticsChartPlotMargin } from "@/lib/analytics-chart-interaction";

export type AnalyticsAreaPoint = { label: string; count: number };

export function AnalyticsAreaChartInner({
  data,
  config,
}: {
  data: AnalyticsAreaPoint[];
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="h-40 min-h-[10rem] w-full">
      <AreaChart data={data} margin={analyticsChartPlotMargin}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} />
        <YAxis tickLine={false} axisLine={false} fontSize={10} width={40} />
        <AnalyticsChartTooltip cursorVariant="area" />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--color-count)"
          fill="var(--color-count)"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        >
          <AnalyticsChartValueLabelList dataKey="count" position="top" />
        </Area>
      </AreaChart>
    </ChartContainer>
  );
}
