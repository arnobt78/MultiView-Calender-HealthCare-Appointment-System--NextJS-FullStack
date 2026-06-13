import { describe, expect, it } from "vitest";
import type { FullAppointment } from "@/hooks/useAppointments";
import { summarizeAppointments } from "@/lib/appointment-stats";

function appt(
  id: string,
  status: string,
  start: string
): FullAppointment {
  return {
    id,
    user_id: "u1",
    title: "Visit",
    start,
    end: start,
    status,
    location: null,
    created_at: start,
    updated_at: null,
    patient: null,
    attachments: [],
    category: null,
    notes: null,
  };
}

describe("useAppointmentListMetrics", () => {
  it("maps summarizeAppointments buckets for stat cards", () => {
    const sample = [
      appt("a1", "done", "2026-06-01T10:00:00.000Z"),
      appt("a2", "pending", "2026-06-02T10:00:00.000Z"),
      appt("a3", "alert", "2026-06-03T10:00:00.000Z"),
    ];
    const s = summarizeAppointments(sample, new Date("2026-06-01T12:00:00.000Z"));
    expect(s.total).toBe(3);
    expect(s.done).toBe(1);
    expect(s.open).toBe(1);
    expect(s.alert).toBe(1);
  });
});
