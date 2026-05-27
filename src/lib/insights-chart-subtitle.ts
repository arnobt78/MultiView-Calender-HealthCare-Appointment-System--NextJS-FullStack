/**
 * Insights chart subtitles — scope + View-as period under chart titles.
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

/** Chart subtitle: scope fragment + period label (sky line under each chart title). */
export function formatInsightsChartContextSubtitle(parts: {
  scopeLabel: string;
  periodLabel: string;
}): string {
  const scope = parts.scopeLabel.trim();
  const period = parts.periodLabel.trim();
  if (!scope) return period;
  if (!period) return scope;
  return `${scope} · ${period}`;
}

/** Resolve full chart subtitle from API meta + optional scope override. */
export function getInsightsChartContextSubtitle(input: {
  meta: InsightsMeta | undefined;
  period: InsightsPeriod;
  scopeLabel: string;
  now?: Date;
}): string {
  const periodLabel =
    getInsightsChartPeriodSubtitle(input.meta) ??
    getInsightsChartPeriodSubtitleFromQuery(input.period, input.now);
  const scopeLabel = input.meta?.scopeLabel?.trim() || input.scopeLabel;
  return formatInsightsChartContextSubtitle({ scopeLabel, periodLabel });
}
