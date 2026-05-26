import { describe, expect, it } from "vitest";
import {
  buildPieChartConfigFromSlices,
  formatAnalyticsChartLabelValue,
} from "@/lib/analytics-chart-interaction";

describe("formatAnalyticsChartLabelValue", () => {
  it("returns null for zero or invalid", () => {
    expect(formatAnalyticsChartLabelValue(0)).toBeNull();
    expect(formatAnalyticsChartLabelValue(-1)).toBeNull();
    expect(formatAnalyticsChartLabelValue("x")).toBeNull();
  });

  it("returns string for positive integers", () => {
    expect(formatAnalyticsChartLabelValue(3)).toBe("3");
  });
});

describe("buildPieChartConfigFromSlices", () => {
  it("keys config by slice name for tooltips", () => {
    const config = buildPieChartConfigFromSlices([
      { name: "Done" },
      { name: "Pending" },
    ]);
    expect(config.Done?.label).toBe("Done");
    expect(config.Pending?.color).toBeTruthy();
    expect(config.count?.label).toBe("Count");
  });
});
