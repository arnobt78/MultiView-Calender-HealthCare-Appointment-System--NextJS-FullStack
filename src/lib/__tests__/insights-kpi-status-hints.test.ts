import { describe, expect, it } from "vitest";
import {
  insightsByStatusToDayStats,
  insightsPendingAllTimeKpiValueRowHint,
  insightsTodayKpiValueRowHint,
} from "@/lib/insights/insights-kpi-status-hints";

describe("insightsByStatusToDayStats", () => {
  it("maps pending to open and keeps other buckets", () => {
    expect(
      insightsByStatusToDayStats({
        pending: 2,
        alert: 1,
        done: 3,
        cancelled: 1,
      })
    ).toEqual({ open: 2, alert: 1, done: 3, cancelled: 1 });
  });
});

describe("insightsTodayKpiValueRowHint", () => {
  it("matches doctor portal Today copy", () => {
    expect(
      insightsTodayKpiValueRowHint({ pending: 0, alert: 0, done: 1, cancelled: 2 })
    ).toBe("Open: 0 · Alert: 0 · Done: 1 · Cancelled: 2");
  });
});

describe("insightsPendingAllTimeKpiValueRowHint", () => {
  it("formats all-time alert, done, cancelled", () => {
    expect(
      insightsPendingAllTimeKpiValueRowHint({ alert: 1, done: 4, cancelled: 2 })
    ).toBe("Alert: 1 · Done: 4 · Cancelled: 2");
  });
});
