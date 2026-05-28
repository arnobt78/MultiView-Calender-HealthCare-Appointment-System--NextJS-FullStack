"use client";

import type { ReactNode } from "react";
import type { AnalyticsChartEmptyCopy } from "@/lib/analytics-chart-empty";
import { AnalyticsChartEmptyOverlay } from "@/components/shared/analytics/AnalyticsChartEmptyOverlay";
import { analyticsChartCartesianHeightClass } from "@/lib/analytics-chart-interaction";
import { cn } from "@/lib/utils";

type Props = {
  /** When true, shows centered empty overlay; children still render (placeholder axes). */
  empty: boolean;
  emptyCopy?: AnalyticsChartEmptyCopy;
  /** Keep plot footprint mounted and pulse only inside chart area while loading. */
  loading?: boolean;
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
  loading = false,
  chartHeightClass = analyticsChartCartesianHeightClass,
  children,
  className,
}: Props) {
  return (
    <div className={cn("relative w-full overflow-visible", chartHeightClass, className)}>
      {children}
      {empty && emptyCopy ? <AnalyticsChartEmptyOverlay copy={emptyCopy} /> : null}
      {loading ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl bg-muted/10 animate-pulse"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
