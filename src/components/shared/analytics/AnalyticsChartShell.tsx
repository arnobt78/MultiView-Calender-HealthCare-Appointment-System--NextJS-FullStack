"use client";

import { useId, type ReactNode } from "react";
import { ChartStyle, type ChartConfig } from "@/components/ui/chart";
import { AnalyticsResponsiveChartContainer } from "@/components/shared/analytics/AnalyticsResponsiveChartContainer";

/**
 * Insights chart wrapper — CSS vars via ChartStyle + stock-inventory ResponsiveContainer shell.
 * Replaces ChartContainer (aspect-video was clipping X-axis ticks and blocking hover targets).
 */
export function AnalyticsChartShell({
  config,
  children,
  containerClassName,
}: {
  config: ChartConfig;
  children: ReactNode;
  /** Override plot height — pie uses shorter shell. */
  containerClassName?: string;
}) {
  const chartId = `chart-${useId().replace(/:/g, "")}`;

  return (
    <div data-chart={chartId} className="w-full min-w-0">
      <ChartStyle id={chartId} config={config} />
      <AnalyticsResponsiveChartContainer className={containerClassName}>
        {children}
      </AnalyticsResponsiveChartContainer>
    </div>
  );
}
