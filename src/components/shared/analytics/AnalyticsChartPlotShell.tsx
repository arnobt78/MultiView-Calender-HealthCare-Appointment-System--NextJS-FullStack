"use client";

import type { ReactNode } from "react";
import type { AnalyticsChartEmptyCopy } from "@/lib/analytics-chart-empty";
import { AnalyticsChartEmptyOverlay } from "@/components/shared/analytics/AnalyticsChartEmptyOverlay";
import { cn } from "@/lib/utils";

type Props = {
  /** When true, shows centered empty overlay; children still render (placeholder axes). */
  empty: boolean;
  emptyCopy?: AnalyticsChartEmptyCopy;
  chartHeightClass?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Relative plot wrapper for insights Recharts — keeps axis layout and overlays empty copy.
 */
export function AnalyticsChartPlotShell({
  empty,
  emptyCopy,
  chartHeightClass = "h-40 min-h-[10rem]",
  children,
  className,
}: Props) {
  return (
    <div className={cn("relative w-full", chartHeightClass, className)}>
      {children}
      {empty && emptyCopy ? <AnalyticsChartEmptyOverlay copy={emptyCopy} /> : null}
    </div>
  );
}
