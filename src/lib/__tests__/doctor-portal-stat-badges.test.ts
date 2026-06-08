import { describe, expect, it } from "vitest";
import {
  doctorPortalAllTimeStatusHintLabel,
  doctorPortalMonthPeriodBadgeLabel,
  doctorPortalTodayStatusBadgeLabel,
  doctorPortalWeekPeriodBadgeLabel,
} from "@/lib/doctor-portal-stat-badges";

const ref = new Date("2026-06-02T15:00:00");

describe("doctorPortalTodayStatusBadgeLabel", () => {
  it("formats compact single-line status chip", () => {
    expect(doctorPortalTodayStatusBadgeLabel({ open: 0, alert: 0, done: 0, cancelled: 0 })).toBe(
      "Open: 0 · Alert: 0 · Done: 0 · Cancelled: 0"
    );
  });
});

describe("doctorPortalWeekPeriodBadgeLabel", () => {
  it("shows Mon through today and passed count", () => {
    expect(doctorPortalWeekPeriodBadgeLabel(2, ref)).toBe("Mon 1 – Jun 2 · 2 passed");
  });
});

describe("doctorPortalMonthPeriodBadgeLabel", () => {
  it("shows month start through today and passed count", () => {
    expect(doctorPortalMonthPeriodBadgeLabel(2, ref)).toBe("Jun 1 – Jun 2 · 2 passed");
  });
});

describe("doctorPortalAllTimeStatusHintLabel", () => {
  it("formats all-time alert, done, and cancelled", () => {
    expect(
      doctorPortalAllTimeStatusHintLabel({ alert: 1, done: 4, cancelled: 2 })
    ).toBe("Alert: 1 · Done: 4 · Cancelled: 2");
  });
});
