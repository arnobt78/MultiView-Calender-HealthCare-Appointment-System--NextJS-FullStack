import { describe, expect, it } from "vitest";
import {
  formatInsightsCalendarMonthHint,
  formatInsightsCalendarTodayHint,
  formatInsightsCalendarWeekHint,
  formatInsightsCalendarYearToDateHint,
  formatInsightsPeriodDisplayLabel,
  formatInsightsPeriodStatValueLabel,
} from "@/lib/insights/insights-period-label";

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

describe("formatInsightsCalendarKpiHints", () => {
  const now = new Date("2026-06-02T12:00:00Z");

  it("formats fixed calendar windows for overview row", () => {
    expect(formatInsightsCalendarTodayHint(now)).toMatch(/Jun 2, 2026/);
    expect(formatInsightsCalendarWeekHint(now)).toContain("–");
    expect(formatInsightsCalendarMonthHint(now)).toBe("June 2026");
    expect(formatInsightsCalendarYearToDateHint(now)).toBe("All time");
  });
});

describe("formatInsightsPeriodStatValueLabel", () => {
  const now = new Date("2026-06-02T12:00:00Z");

  it("returns compact labels without Today/This week prefixes", () => {
    expect(formatInsightsPeriodStatValueLabel("all")).toBe("All time");
    expect(formatInsightsPeriodStatValueLabel("day", now)).toMatch(/Jun 2, 2026/);
    expect(formatInsightsPeriodStatValueLabel("week", now)).toContain("–");
    expect(formatInsightsPeriodStatValueLabel("month", now)).toBe("June 2026");
    expect(formatInsightsPeriodStatValueLabel("year", now)).toBe("2026");
  });
});
