"use client";

import { CartesianGrid, Line, LineChart, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { AnalyticsChartShell } from "@/components/shared/analytics/AnalyticsChartShell";
import { analyticsChartSlopedXAxisEl } from "@/components/shared/analytics/AnalyticsChartSlopedXAxis";
import { analyticsChartTooltipEl } from "@/components/shared/analytics/AnalyticsChartTooltip";
import {
  analyticsChartCartesianPropsForDensity,
  analyticsChartResponsiveHeightWrapClass,
  analyticsSeriesPointLabel,
  type AnalyticsChartXAxisLayout,
} from "@/lib/analytics-chart-interaction";
import type { AnalyticsLinePoint } from "@/components/shared/analytics/AnalyticsLineChart";

export function AnalyticsLineChartInner({
  data,
  config,
  xAxisLayout = "sloped",
}: {
  data: AnalyticsLinePoint[];
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
      <LineChart data={data} {...analyticsChartCartesianPropsForDensity(xAxisLayout, data.length)}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        {analyticsChartSlopedXAxisEl("label", xAxisLayout, data.length)}
        <YAxis tickLine={false} axisLine={false} fontSize={10} width={32} />
        {analyticsChartTooltipEl("line", { config })}
        <Line
          type="monotone"
          dataKey="count"
          name={seriesName}
          stroke="var(--color-count)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
          label={analyticsSeriesPointLabel}
        />
      </LineChart>
    </AnalyticsChartShell>
  );
}
