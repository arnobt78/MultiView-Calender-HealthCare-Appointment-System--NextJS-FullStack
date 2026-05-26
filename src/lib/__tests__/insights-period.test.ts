import { describe, expect, it } from "vitest";
import {
  DEFAULT_INSIGHTS_PERIOD,
  parsePeriodFromSearchParams,
  resolveDateRange,
  trendBucketCount,
} from "@/lib/insights/insights-period";

describe("insights-period", () => {
  it("defaults to month", () => {
    expect(parsePeriodFromSearchParams({})).toBe(DEFAULT_INSIGHTS_PERIOD);
  });

  it("parses valid period", () => {
    expect(parsePeriodFromSearchParams({ period: "week" })).toBe("week");
  });

  it("resolveDateRange week includes seven day buckets", () => {
    const now = new Date("2026-05-25T12:00:00Z");
    const range = resolveDateRange("week", now);
    expect(range.start.getTime()).toBeLessThanOrEqual(now.getTime());
    expect(trendBucketCount("week")).toBe(7);
  });

  it("year range starts Jan 1", () => {
    const now = new Date("2026-05-25T12:00:00Z");
    const range = resolveDateRange("year", now);
    expect(range.start.getMonth()).toBe(0);
    expect(range.start.getDate()).toBe(1);
  });
});
