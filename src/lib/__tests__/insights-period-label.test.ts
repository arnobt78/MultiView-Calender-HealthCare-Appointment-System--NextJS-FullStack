import { describe, expect, it } from "vitest";
import { formatInsightsPeriodDisplayLabel } from "@/lib/insights/insights-period-label";

describe("formatInsightsPeriodDisplayLabel", () => {
  it("returns All time without date brackets", () => {
    expect(formatInsightsPeriodDisplayLabel("all")).toBe("All time");
  });

  const now = new Date("2026-05-27T12:00:00Z");

  it("week includes bracketed start and end day dates", () => {
    const label = formatInsightsPeriodDisplayLabel("week", now);
    expect(label).toMatch(/^This week \(/);
    expect(label).toContain("–");
    expect(label.endsWith(")")).toBe(true);
  });

  it("day includes single date in brackets", () => {
    const label = formatInsightsPeriodDisplayLabel("day", now);
    expect(label).toMatch(/^Today \(/);
  });

  it("month includes range in brackets", () => {
    const label = formatInsightsPeriodDisplayLabel("month", now);
    expect(label).toContain("May 2026");
    expect(label).toContain("–");
  });
});
