import { describe, expect, it } from "vitest";
import {
  formatDashboardOverviewLastUpdated,
  resolveDashboardOverviewUpdatedAt,
} from "@/lib/dashboard-overview-subtitle";

describe("formatDashboardOverviewLastUpdated", () => {
  it("formats HH:mm:ss from epoch ms", () => {
    const ms = new Date(2026, 5, 10, 13, 46, 36).getTime();
    expect(formatDashboardOverviewLastUpdated(ms)).toBe("13:46:36");
  });
});

describe("resolveDashboardOverviewUpdatedAt", () => {
  it("prefers query timestamp over SSR fallback", () => {
    expect(resolveDashboardOverviewUpdatedAt(100, 50)).toBe(100);
  });

  it("uses SSR when query dataUpdatedAt is 0 (persist without updatedAt)", () => {
    expect(resolveDashboardOverviewUpdatedAt(0, 999)).toBe(999);
  });

  it("returns 0 when neither source has a timestamp", () => {
    expect(resolveDashboardOverviewUpdatedAt(0, undefined)).toBe(0);
  });
});
