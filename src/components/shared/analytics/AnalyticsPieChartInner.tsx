"use client";

import { Cell, Pie, PieChart } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { AnalyticsChartShell } from "@/components/shared/analytics/AnalyticsChartShell";
import { analyticsPieChartTooltipEl } from "@/components/shared/analytics/AnalyticsChartTooltip";
import { AnalyticsPieSliceLabel } from "@/components/shared/analytics/AnalyticsPieSliceLabel";
import { AnalyticsPieSliceLabelLine } from "@/components/shared/analytics/AnalyticsPieSliceLabelLine";
import { ANALYTICS_CHART_COLORS } from "@/components/shared/analytics/analytics-chart-classes";
import { shouldShowPieLabelLines } from "@/lib/analytics-chart-interaction";

export type AnalyticsPiePoint = { name: string; count: number };

export function AnalyticsPieChartInner({
  data,
  config,
}: {
  data: AnalyticsPiePoint[];
  config: ChartConfig;
}) {
  return (
    <AnalyticsChartShell
      config={config}
      containerClassName="mx-auto h-48 min-h-[12rem] w-full max-w-sm"
    >
      <PieChart margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        {analyticsPieChartTooltipEl({ config })}
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={64}
          label={(props: PieLabelRenderProps) => <AnalyticsPieSliceLabel {...props} />}
          labelLine={
            shouldShowPieLabelLines(data)
              ? (props: PieLabelRenderProps) => <AnalyticsPieSliceLabelLine {...props} />
              : false
          }
          isAnimationActive={false}
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
        </Pie>
      </PieChart>
    </AnalyticsChartShell>
  );
}
