"use client";

import { Bar, BarChart, CartesianGrid, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { AnalyticsChartShell } from "@/components/shared/analytics/AnalyticsChartShell";
import { analyticsChartSlopedXAxisEl } from "@/components/shared/analytics/AnalyticsChartSlopedXAxis";
import { analyticsChartTooltipEl } from "@/components/shared/analytics/AnalyticsChartTooltip";
import {
  analyticsChartCartesianPropsForLayout,
  analyticsChartResponsiveHeightWrapClass,
  analyticsSeriesPointLabel,
  type AnalyticsChartXAxisLayout,
} from "@/lib/analytics-chart-interaction";

export type AnalyticsBarPoint = { label: string; count: number };

export function AnalyticsBarChartInner({
  data,
  config,
  xAxisLayout = "sloped",
}: {
  data: AnalyticsBarPoint[];
  config: ChartConfig;
  xAxisLayout?: AnalyticsChartXAxisLayout;
}) {
  const seriesName = String(config.count?.label ?? "Appointments");

  return (
    <AnalyticsChartShell
      config={config}
      containerClassName={
        xAxisLayout === "wrap" ? analyticsChartResponsiveHeightWrapClass : undefined
      }
    >
      <BarChart data={data} {...analyticsChartCartesianPropsForLayout(xAxisLayout)}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        {analyticsChartSlopedXAxisEl("label", xAxisLayout)}
        <YAxis tickLine={false} axisLine={false} fontSize={10} width={32} />
        {analyticsChartTooltipEl("bar", { config })}
        <Bar
          dataKey="count"
          name={seriesName}
          fill="var(--color-count)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
          label={analyticsSeriesPointLabel}
        />
      </BarChart>
    </AnalyticsChartShell>
  );
}
