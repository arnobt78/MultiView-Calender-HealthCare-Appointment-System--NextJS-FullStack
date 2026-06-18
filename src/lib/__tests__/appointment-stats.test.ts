import { describe, expect, it } from "vitest";
import {
  buildDailyStatsMap,
  dateKey,
  resolveDayStatsForDate,
  summarizeAppointments,
  summarizeDayAppointments,
  summarizePatientPortalSidebar,
} from "@/lib/appointment-stats";
import type { FullAppointment } from "@/hooks/useAppointments";

function appt(start: string, status: string): FullAppointment {
  return {
    id: `appt-${start}-${status}`,
    start,
    end: start,
    status,
    title: "Test",
    patient_id: "p1",
    category_id: "c1",
    user_id: "u1",
    created_at: start,
    updated_at: start,
  } as unknown as FullAppointment;
}

describe("summarizeDayAppointments", () => {
  it("buckets pending, alert, done, and cancelled separately", () => {
    const stats = summarizeDayAppointments([
      appt("2026-06-08T10:00:00Z", "pending"),
      appt("2026-06-08T11:00:00Z", "alert"),
      appt("2026-06-08T12:00:00Z", "done"),
      appt("2026-06-08T13:00:00Z", "cancelled"),
    ]);
    expect(stats).toEqual({
      total: 4,
      open: 1,
      alert: 1,
      done: 1,
      cancelled: 1,
    });
  });

  it("does not count cancelled as open", () => {
    const stats = summarizeDayAppointments([
      appt("2026-06-08T10:00:00Z", "cancelled"),
      appt("2026-06-08T11:00:00Z", "cancelled"),
    ]);
    expect(stats.open).toBe(0);
    expect(stats.cancelled).toBe(2);
  });
});

describe("buildDailyStatsMap", () => {
  it("indexes per-day stats by dateKey", () => {
    const map = buildDailyStatsMap([
      appt("2026-06-08T10:00:00Z", "pending"),
      appt("2026-06-08T11:00:00Z", "cancelled"),
      appt("2026-06-07T10:00:00Z", "done"),
    ]);
    const day8 = dateKey(new Date("2026-06-08T12:00:00Z"));
    expect(map[day8]).toEqual({
      total: 2,
      open: 1,
      alert: 0,
      done: 0,
      cancelled: 1,
    });
  });
});

describe("resolveDayStatsForDate", () => {
  it("uses cached map when preferCached is true", () => {
    const map = buildDailyStatsMap([appt("2026-06-08T10:00:00Z", "alert")]);
    const stats = resolveDayStatsForDate({
      date: new Date("2026-06-08T12:00:00Z"),
      filteredDayAppts: [],
      dailyStatsMap: map,
      preferCached: true,
    });
    expect(stats.alert).toBe(1);
  });

  it("uses filtered list when preferCached is false", () => {
    const map = buildDailyStatsMap([appt("2026-06-08T10:00:00Z", "alert")]);
    const stats = resolveDayStatsForDate({
      date: new Date("2026-06-08T12:00:00Z"),
      filteredDayAppts: [appt("2026-06-08T10:00:00Z", "done")],
      dailyStatsMap: map,
      preferCached: false,
    });
    expect(stats.done).toBe(1);
    expect(stats.alert).toBe(0);
  });
});

describe("summarizePatientPortalSidebar", () => {
  const referenceDate = new Date("2026-06-18T12:00:00");

  it("matches portal screenshot buckets — open+alert upcoming, cancelled separate", () => {
    const stats = summarizePatientPortalSidebar(
      [
        { start: "2026-06-18T10:00:00Z", status: "cancelled" },
        { start: "2026-06-17T10:00:00Z", status: "cancelled" },
        { start: "2026-06-25T10:00:00Z", status: "pending" },
        { start: "2026-06-26T10:00:00Z", status: "alert" },
        { start: "2026-06-27T10:00:00Z", status: "done" },
      ],
      referenceDate
    );
    expect(stats).toEqual({
      total: 5,
      completed: 1,
      upcoming: 2,
      cancelled: 2,
    });
  });

  it("excludes past open/alert from upcoming", () => {
    const stats = summarizePatientPortalSidebar(
      [
        { start: "2026-06-17T10:00:00Z", status: "pending" },
        { start: "2026-06-25T10:00:00Z", status: "alert" },
      ],
      referenceDate
    );
    expect(stats.upcoming).toBe(1);
    expect(stats.completed).toBe(0);
    expect(stats.cancelled).toBe(0);
  });

  it("counts all cancelled regardless of date", () => {
    const stats = summarizePatientPortalSidebar(
      [
        { start: "2026-06-18T10:00:00Z", status: "cancelled" },
        { start: "2026-06-30T10:00:00Z", status: "cancelled" },
      ],
      referenceDate
    );
    expect(stats.cancelled).toBe(2);
    expect(stats.upcoming).toBe(0);
  });
});

describe("summarizeAppointments", () => {
  const base = new Date("2026-06-08T12:00:00");

  it("counts cancelled in status row separately from open", () => {
    const stats = summarizeAppointments(
      [
        appt("2026-06-08T10:00:00Z", "pending"),
        appt("2026-06-08T11:00:00Z", "cancelled"),
        appt("2026-06-07T10:00:00Z", "done"),
      ],
      base
    );
    expect(stats.open).toBe(1);
    expect(stats.cancelled).toBe(1);
    expect(stats.done).toBe(1);
    expect(stats.today).toBe(2);
    expect(stats.passed).toBe(1);
  });
});
