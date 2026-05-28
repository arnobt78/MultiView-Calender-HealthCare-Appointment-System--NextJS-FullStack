"use client";

import { Area, AreaChart, CartesianGrid, YAxis } from "recharts";
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

export type AnalyticsAreaPoint = { label: string; count: number };

export function AnalyticsAreaChartInner({
  data,
  config,
  xAxisLayout = "sloped",
}: {
  data: AnalyticsAreaPoint[];
  config: ChartConfig;
  xAxisLayout?: AnalyticsChartXAxisLayout;
}) {
  const seriesName = String(config.count?.label ?? "Revenue");

  return (
    <AnalyticsChartShell
      config={config}
      containerClassName={
        xAxisLayout === "wrap" ? analyticsChartResponsiveHeightWrapClass : undefined
      }
    >
      <AreaChart data={data} {...analyticsChartCartesianPropsForLayout(xAxisLayout)}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        {analyticsChartSlopedXAxisEl("label", xAxisLayout)}
        <YAxis tickLine={false} axisLine={false} fontSize={10} width={40} />
        {analyticsChartTooltipEl("area", { valueKind: "currency", config })}
        <Area
          type="monotone"
          dataKey="count"
          name={seriesName}
          stroke="var(--color-count)"
          fill="var(--color-count)"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
          label={analyticsSeriesPointLabel}
        />
      </AreaChart>
    </AnalyticsChartShell>
  );
}
