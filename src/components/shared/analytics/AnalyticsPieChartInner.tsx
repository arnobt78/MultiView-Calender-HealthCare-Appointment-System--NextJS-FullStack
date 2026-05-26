"use client";

import {
  Cell,
  ChartContainer,
  Pie,
  PieChart,
  type ChartConfig,
} from "@/components/ui/chart";
import { AnalyticsPieChartTooltip } from "@/components/shared/analytics/AnalyticsChartTooltip";
import { AnalyticsChartValueLabelList } from "@/components/shared/analytics/AnalyticsChartValueLabelList";
import { ANALYTICS_CHART_COLORS } from "@/components/shared/analytics/analytics-chart-classes";

export type AnalyticsPiePoint = { name: string; count: number };

export function AnalyticsPieChartInner({
  data,
  config,
}: {
  data: AnalyticsPiePoint[];
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="mx-auto h-48 min-h-[12rem] w-full max-w-sm">
      <PieChart>
        <AnalyticsPieChartTooltip />
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={72}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}-${index}`}
              fill={
                config[entry.name]?.color ??
                ANALYTICS_CHART_COLORS[index % ANALYTICS_CHART_COLORS.length]
              }
            />
          ))}
          <AnalyticsChartValueLabelList
            dataKey="count"
            position="outside"
            className="fill-foreground text-[10px] font-semibold"
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
