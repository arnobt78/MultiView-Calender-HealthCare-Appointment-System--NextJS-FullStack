/**
 * Insights time period — day/week/month/year/all buckets for API + query keys.
 */

export type InsightsPeriod = "day" | "week" | "month" | "year" | "all";

export const INSIGHTS_PERIODS: InsightsPeriod[] = [
  "day",
  "week",
  "month",
  "year",
  "all",
];

export const DEFAULT_INSIGHTS_PERIOD: InsightsPeriod = "month";

/** Placeholder axis bucket count for period=all (yearly trend cap). */
export const INSIGHTS_ALL_TIME_TREND_BUCKET_CAP = 12;

/** Prisma/PostgreSQL-safe bounds — never use Number.MAX_SAFE_INTEGER ms (invalid +275760 dates). */
export const INSIGHTS_ALL_TIME_RANGE_START = new Date(Date.UTC(1970, 0, 1));
export const INSIGHTS_ALL_TIME_RANGE_END = new Date(Date.UTC(2100, 11, 31, 23, 59, 59, 999));

export type InsightsDateRange = {
  start: Date;
  end: Date;
  /** Human label for chart axis / meta */
  label: string;
};

type SearchParamInput = Record<string, string | string[] | undefined> | URLSearchParams;

function readParam(input: SearchParamInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) {
    return input.get(key) ?? undefined;
  }
  const raw = input[key];
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

export function isInsightsPeriodAll(period: InsightsPeriod): period is "all" {
  return period === "all";
}

export function defaultPeriodForRole(_role: string | null | undefined): InsightsPeriod {
  return DEFAULT_INSIGHTS_PERIOD;
}

export function parsePeriodFromSearchParams(
  input: SearchParamInput,
  role?: string | null
): InsightsPeriod {
  const raw = readParam(input, "period");
  if (
    raw === "day" ||
    raw === "week" ||
    raw === "month" ||
    raw === "year" ||
    raw === "all"
  ) {
    return raw;
  }
  return defaultPeriodForRole(role);
}

/**
 * Calendar boundaries for appointment charts — full period window (includes future
 * scheduled rows through period end, e.g. rest of month/year).
 * For `all`, returns sentinel label only — aggregates must use insights-period-filter.
 */
export function resolveDateRangeInclusive(period: InsightsPeriod, now = new Date()): InsightsDateRange {
  switch (period) {
    case "all":
      return {
        start: INSIGHTS_ALL_TIME_RANGE_START,
        end: INSIGHTS_ALL_TIME_RANGE_END,
        label: "All time",
      };
    case "day": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { start, end, label: "Today" };
    }
    case "week": {
      const day = now.getDay();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end, label: "This week" };
    }
    case "year": {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end, label: String(now.getFullYear()) };
    }
    case "month":
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return {
        start,
        end,
        label: start.toLocaleDateString("en", { month: "long", year: "numeric" }),
      };
    }
  }
}

/** Calendar boundaries for the selected period (inclusive end = now). */
export function resolveDateRange(period: InsightsPeriod, now = new Date()): InsightsDateRange {
  if (isInsightsPeriodAll(period)) {
    return resolveDateRangeInclusive(period, now);
  }
  const end = now;
  switch (period) {
    case "day": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start, end, label: "Today" };
    }
    case "week": {
      const day = now.getDay();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      return { start, end, label: "This week" };
    }
    case "year": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start, end, label: String(now.getFullYear()) };
    }
    case "month":
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end, label: start.toLocaleDateString("en", { month: "long", year: "numeric" }) };
    }
  }
}

/** Previous period of equal length — used for revenue delta; all-time has no prior window. */
export function resolvePreviousDateRange(
  period: InsightsPeriod,
  now = new Date()
): InsightsDateRange {
  if (isInsightsPeriodAll(period)) {
    const t = now.getTime();
    return {
      start: new Date(t),
      end: new Date(t),
      label: "Previous period",
    };
  }
  const current = resolveDateRange(period, now);
  const durationMs = current.end.getTime() - current.start.getTime();
  const prevEnd = new Date(current.start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return {
    start: prevStart,
    end: prevEnd,
    label: "Previous period",
  };
}

/** Number of trend buckets to emit for volume-trend charts (must match insights-aggregate). */
export function trendBucketCount(period: InsightsPeriod, now = new Date()): number {
  switch (period) {
    case "all":
      return INSIGHTS_ALL_TIME_TREND_BUCKET_CAP;
    case "day":
      return 24;
    case "week":
      return 7;
    case "year":
      return 12;
    case "month":
    default:
      return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }
}
