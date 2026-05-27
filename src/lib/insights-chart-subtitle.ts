/**
 * Insights chart period subtitle — single dynamic line under chart titles (View as filter).
 */

import { formatInsightsPeriodDisplayLabel } from "@/lib/insights/insights-period-label";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import type { InsightsMeta } from "@/lib/insights/insights-types";

/** Period label from v2 meta (includes week date range in brackets when applicable). */
export function getInsightsChartPeriodSubtitle(meta: InsightsMeta | undefined): string | undefined {
  const label = meta?.periodLabel?.trim();
  return label || undefined;
}

/** SSR/client fallback when meta is not hydrated yet. */
export function getInsightsChartPeriodSubtitleFromQuery(
  period: InsightsPeriod,
  now = new Date()
): string {
  return formatInsightsPeriodDisplayLabel(period, now);
}
