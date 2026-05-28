"use client";

import type { ReactElement, ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

/**
 * Stock-inventory pattern — explicit height + minHeight so Recharts never gets 0×0.
 * Do not use shadcn ChartContainer here (aspect-video + justify-center collapses the plot).
 */
export function AnalyticsResponsiveChartContainer({
  children,
  className = "w-full min-w-0 h-[240px]",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={{ minWidth: 1, minHeight: 200 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        {children as ReactElement}
      </ResponsiveContainer>
    </div>
  );
}
