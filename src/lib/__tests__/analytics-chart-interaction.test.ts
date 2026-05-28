import { describe, expect, it } from "vitest";
import {
  buildPieChartConfigFromSlices,
  formatAnalyticsChartLabelValue,
  formatAnalyticsChartTooltipValue,
  formatStackedBarSegmentLabel,
  formatStackedBarTotalLabel,
  resolveAnalyticsChartXAxisLayout,
  resolveAnalyticsTooltipSeriesLabel,
  shouldShowPieLabelLines,
  shouldShowPieSliceLabelLine,
  wrapCategoryAxisLabel,
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

describe("formatAnalyticsChartTooltipValue", () => {
  it("returns 0 for zero count", () => {
    expect(formatAnalyticsChartTooltipValue(0)).toBe("0");
  });

  it("formats currency cents when kind is currency", () => {
    expect(formatAnalyticsChartTooltipValue(2500, "currency")).toMatch(/25/);
  });
});

describe("formatStackedBarSegmentLabel", () => {
  const row = { month: "Jan", done: 2, pending: 1, alert: 0 };

  it("shows label only on topmost non-zero segment", () => {
    expect(formatStackedBarSegmentLabel("pending", 1, row)).toBe("1");
    expect(formatStackedBarSegmentLabel("done", 2, row)).toBe("");
    expect(formatStackedBarSegmentLabel("alert", 0, row)).toBe("");
  });

  it("uses alert when it is the only non-zero segment", () => {
    const alertOnly = { month: "Feb", done: 0, pending: 0, alert: 4 };
    expect(formatStackedBarSegmentLabel("alert", 4, alertOnly)).toBe("4");
  });
});

describe("formatStackedBarTotalLabel", () => {
  it("sums done, pending, alert for top label", () => {
    expect(
      formatStackedBarTotalLabel(0, { done: 0, pending: 0, alert: 1 })
    ).toBe("1");
    expect(
      formatStackedBarTotalLabel(0, { done: 1, pending: 2, alert: 0 })
    ).toBe("3");
  });
});

describe("shouldShowPieLabelLines", () => {
  it("hides lines for single active slice", () => {
    expect(shouldShowPieLabelLines([{ count: 5 }, { count: 0 }])).toBe(false);
    expect(shouldShowPieLabelLines([{ count: 3 }, { count: 2 }])).toBe(true);
  });
});

describe("shouldShowPieSliceLabelLine", () => {
  it("hides connector for dominant and tiny slices", () => {
    expect(shouldShowPieSliceLabelLine(0.55)).toBe(false);
    expect(shouldShowPieSliceLabelLine(0.02)).toBe(false);
    expect(shouldShowPieSliceLabelLine(0.13)).toBe(true);
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

describe("resolveAnalyticsChartXAxisLayout", () => {
  it("returns sloped for every chart kind", () => {
    expect(resolveAnalyticsChartXAxisLayout("appointments-by-doctor")).toBe("sloped");
    expect(resolveAnalyticsChartXAxisLayout("by-category")).toBe("sloped");
    expect(resolveAnalyticsChartXAxisLayout("volume-trend")).toBe("sloped");
  });
});

describe("wrapCategoryAxisLabel", () => {
  it("returns one line for short labels", () => {
    expect(wrapCategoryAxisLabel("Mon")).toEqual(["Mon"]);
  });

  it("wraps long doctor names into multiple lines", () => {
    const lines = wrapCategoryAxisLabel("Demo Doctor Seven", 12, 3);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join(" ")).toContain("Demo");
  });
});

describe("resolveAnalyticsTooltipSeriesLabel", () => {
  it("prefers ChartConfig label", () => {
    expect(
      resolveAnalyticsTooltipSeriesLabel("count", "Count", {
        count: { label: "Appointments", color: "#000" },
      })
    ).toBe("Appointments");
  });

  it("title-cases dataKey when config missing", () => {
    expect(resolveAnalyticsTooltipSeriesLabel("done", undefined, {})).toBe("Done");
  });

  it("uses stacked keys from config", () => {
    expect(
      resolveAnalyticsTooltipSeriesLabel("pending", "Pending", {
        pending: { label: "Pending", color: "#f00" },
      })
    ).toBe("Pending");
  });

  it("uses payload fallback label for pie slices", () => {
    expect(
      resolveAnalyticsTooltipSeriesLabel("count", "Count", { count: { label: "Count" } }, "Oncology")
    ).toBe("Oncology");
  });

  it("uses fallback when name is generic count even without dataKey", () => {
    expect(
      resolveAnalyticsTooltipSeriesLabel(undefined, "Count", { count: { label: "Count" } }, "Telehealth Session")
    ).toBe("Telehealth Session");
  });
});
