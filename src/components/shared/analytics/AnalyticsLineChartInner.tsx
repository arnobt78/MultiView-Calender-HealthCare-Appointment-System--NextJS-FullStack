"use client";

import {
  ChartContainer,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  type ChartConfig,
} from "@/components/ui/chart";
import { AnalyticsChartTooltip } from "@/components/shared/analytics/AnalyticsChartTooltip";
import { AnalyticsChartValueLabelList } from "@/components/shared/analytics/AnalyticsChartValueLabelList";
import { analyticsChartPlotMargin } from "@/lib/analytics-chart-interaction";
import type { AnalyticsLinePoint } from "@/components/shared/analytics/AnalyticsLineChart";

export function AnalyticsLineChartInner({
  data,
  config,
}: {
  data: AnalyticsLinePoint[];
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="h-40 min-h-[10rem] w-full">
      <LineChart data={data} margin={analyticsChartPlotMargin}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} />
        <YAxis tickLine={false} axisLine={false} fontSize={10} width={32} />
        <AnalyticsChartTooltip cursorVariant="line" />
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--color-count)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        >
          <AnalyticsChartValueLabelList dataKey="count" position="top" />
        </Line>
      </LineChart>
    </ChartContainer>
  );
}
