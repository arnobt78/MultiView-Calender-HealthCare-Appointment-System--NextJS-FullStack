/**
 * Insights chart period subtitle — single dynamic line under chart titles (View as filter).
 */

import type { InsightsPeriod } from "@/lib/insights/insights-period";
import { resolveDateRangeInclusive } from "@/lib/insights/insights-period";
import type { InsightsMeta } from "@/lib/insights/insights-types";

/** Period label from v2 meta (Today, This week, May 2026, 2026). */
export function getInsightsChartPeriodSubtitle(meta: InsightsMeta | undefined): string | undefined {
  const label = meta?.periodLabel?.trim();
  return label || undefined;
}

/** SSR/client fallback when meta is not hydrated yet. */
export function getInsightsChartPeriodSubtitleFromQuery(
  period: InsightsPeriod,
  now = new Date()
): string {
  return resolveDateRangeInclusive(period, now).label;
}
