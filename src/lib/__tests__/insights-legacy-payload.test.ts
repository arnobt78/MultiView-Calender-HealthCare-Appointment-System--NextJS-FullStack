import { describe, expect, it } from "vitest";
import { legacyMonthlyDataFromTrend } from "@/lib/insights/insights-legacy-payload";

describe("legacyMonthlyDataFromTrend", () => {
  it("maps trend labels to legacy monthlyData rows", () => {
    const trend = [
      { label: "Jan", count: 4 },
      { label: "Feb", count: 2 },
    ];
    expect(legacyMonthlyDataFromTrend(trend, "year")).toEqual([
      { month: "Jan", count: 4 },
      { month: "Feb", count: 2 },
    ]);
  });
});
