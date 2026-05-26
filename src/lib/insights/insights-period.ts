/**
 * Insights time period — day/week/month/year buckets for API + query keys.
 */

export type InsightsPeriod = "day" | "week" | "month" | "year";

export const INSIGHTS_PERIODS: InsightsPeriod[] = ["day", "week", "month", "year"];

export const DEFAULT_INSIGHTS_PERIOD: InsightsPeriod = "month";

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

export function defaultPeriodForRole(_role: string | null | undefined): InsightsPeriod {
  return DEFAULT_INSIGHTS_PERIOD;
}

export function parsePeriodFromSearchParams(
  input: SearchParamInput,
  role?: string | null
): InsightsPeriod {
  const raw = readParam(input, "period");
  if (raw === "day" || raw === "week" || raw === "month" || raw === "year") {
    return raw;
  }
  return defaultPeriodForRole(role);
}

/** Calendar boundaries for the selected period (inclusive end = now). */
export function resolveDateRange(period: InsightsPeriod, now = new Date()): InsightsDateRange {
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

/** Previous period of equal length — used for revenue delta. */
export function resolvePreviousDateRange(
  period: InsightsPeriod,
  now = new Date()
): InsightsDateRange {
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

/** Number of trend buckets to emit for charts. */
export function trendBucketCount(period: InsightsPeriod): number {
  switch (period) {
    case "day":
      return 24;
    case "week":
      return 7;
    case "year":
      return 12;
    case "month":
    default:
      return 12;
  }
}
