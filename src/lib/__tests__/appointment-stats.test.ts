import { describe, expect, it } from "vitest";
import {
  summarizeAppointments,
  summarizeDayAppointments,
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
