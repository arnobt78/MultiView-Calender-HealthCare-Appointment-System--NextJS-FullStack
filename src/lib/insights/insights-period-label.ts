/**
 * Human-readable View-as labels for /insights — chart subtitles + By status row.
 * Week includes bracketed day/date range; other periods add range detail where useful.
 */

import type { InsightsPeriod } from "@/lib/insights/insights-period";
import { resolveDateRangeInclusive } from "@/lib/insights/insights-period";

const ENDPOINT_DATE: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
};

const ENDPOINT_DATE_YEAR: Intl.DateTimeFormatOptions = {
  ...ENDPOINT_DATE,
  year: "numeric",
};

function formatRangeEndpoint(date: Date, withYear: boolean): string {
  return date.toLocaleDateString("en-US", withYear ? ENDPOINT_DATE_YEAR : ENDPOINT_DATE);
}

/** Display label stored on `v2.meta.periodLabel` and used in chart / status subtitles. */
export function formatInsightsPeriodDisplayLabel(
  period: InsightsPeriod,
  now = new Date()
): string {
  const range = resolveDateRangeInclusive(period, now);

  switch (period) {
    case "all":
      return "All time";
    case "day":
      return `Today (${formatRangeEndpoint(range.start, true)})`;
    case "week":
      return `This week (${formatRangeEndpoint(range.start, false)} – ${formatRangeEndpoint(range.end, true)})`;
    case "year":
      return `${range.label} (${formatRangeEndpoint(range.start, false)} – ${formatRangeEndpoint(range.end, true)})`;
    case "month":
    default:
      return `${range.label} (${formatRangeEndpoint(range.start, false)} – ${formatRangeEndpoint(range.end, true)})`;
  }
}
