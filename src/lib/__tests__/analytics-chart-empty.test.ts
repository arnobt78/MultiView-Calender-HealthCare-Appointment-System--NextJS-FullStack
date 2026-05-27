import { describe, expect, it } from "vitest";
import {
  analyticsPlaceholderTrendBucketCount,
  buildAnalyticsPlaceholderAxisData,
  getAnalyticsChartEmptyCopy,
  isAnalyticsCountSeriesEmpty,
} from "@/lib/analytics-chart-empty";

describe("isAnalyticsCountSeriesEmpty", () => {
  it("returns true for empty array", () => {
    expect(isAnalyticsCountSeriesEmpty([])).toBe(true);
  });

  it("returns true when all counts are zero", () => {
    expect(isAnalyticsCountSeriesEmpty([{ count: 0 }, { count: 0 }])).toBe(true);
  });

  it("returns false when any count is positive", () => {
    expect(isAnalyticsCountSeriesEmpty([{ count: 0 }, { count: 1 }])).toBe(false);
  });

  it("returns true when stacked totals are all zero", () => {
    expect(
      isAnalyticsCountSeriesEmpty([{ done: 0, pending: 0, alert: 0 }])
    ).toBe(true);
  });

  it("returns false when stacked segment has value", () => {
    expect(
      isAnalyticsCountSeriesEmpty([{ done: 1, pending: 0, alert: 0 }])
    ).toBe(false);
  });
});

describe("buildAnalyticsPlaceholderAxisData", () => {
  const now = new Date("2026-05-27T12:00:00Z");

  it("volume-trend day has 24 buckets", () => {
    const rows = buildAnalyticsPlaceholderAxisData("volume-trend", "day", now);
    expect(rows).toHaveLength(24);
    expect(rows[0]).toEqual({ label: "0:00", count: 0 });
  });

  it("volume-trend week has 7 weekday labels", () => {
    const rows = buildAnalyticsPlaceholderAxisData("volume-trend", "week", now);
    expect(rows).toHaveLength(7);
    expect((rows[0] as { label: string }).label).toBe("Sun");
  });

  it("status-over-time month matches days in month", () => {
    const rows = buildAnalyticsPlaceholderAxisData("status-over-time", "month", now);
    expect(rows).toHaveLength(31);
    expect((rows[0] as { month: string }).month).toBeTruthy();
  });

  it("visit-types returns empty for pie overlay-only", () => {
    expect(buildAnalyticsPlaceholderAxisData("visit-types", "month", now)).toEqual([]);
  });

  it("matches trendBucketCount for year", () => {
    const rows = buildAnalyticsPlaceholderAxisData("volume-trend", "year", now);
    expect(rows).toHaveLength(analyticsPlaceholderTrendBucketCount("year", now));
  });
});

describe("getAnalyticsChartEmptyCopy", () => {
  it("returns title per kind", () => {
    expect(getAnalyticsChartEmptyCopy("paid-revenue").title).toContain("revenue");
  });
});
