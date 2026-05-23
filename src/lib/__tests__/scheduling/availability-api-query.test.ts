import { describe, expect, it } from "vitest";
import {
  parseAvailabilityDatesQuery,
  parseAvailabilitySlotsQuery,
} from "@/lib/scheduling/availability-api-query";

const DOCTOR = "550e8400-e29b-41d4-a716-446655440000";
const TYPE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const APPT = "00000000-0000-4000-8000-000000000001";

describe("parseAvailabilityDatesQuery", () => {
  it("accepts typeId + month", () => {
    const q = new URLSearchParams({
      doctorId: DOCTOR,
      typeId: TYPE,
      month: "2026-05",
    });
    const r = parseAvailabilityDatesQuery(q);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.schedulingScope).toEqual({ kind: "type", typeId: TYPE });
      expect(r.monthYm).toBe("2026-05");
    }
  });

  it("accepts flexDurationMinutes + month", () => {
    const q = new URLSearchParams({
      doctorId: DOCTOR,
      flexDurationMinutes: "30",
      month: "2026-06",
    });
    const r = parseAvailabilityDatesQuery(q);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.schedulingScope).toEqual({ kind: "flex", durationMinutes: 30 });
    }
  });

  it("rejects both typeId and flexDurationMinutes", () => {
    const q = new URLSearchParams({
      doctorId: DOCTOR,
      typeId: TYPE,
      flexDurationMinutes: "30",
      month: "2026-05",
    });
    expect(parseAvailabilityDatesQuery(q).ok).toBe(false);
  });

  it("rejects invalid flex duration", () => {
    const q = new URLSearchParams({
      doctorId: DOCTOR,
      flexDurationMinutes: "25",
      month: "2026-05",
    });
    expect(parseAvailabilityDatesQuery(q).ok).toBe(false);
  });

  it("sanitizes excludeAppointmentId", () => {
    const q = new URLSearchParams({
      doctorId: DOCTOR,
      typeId: TYPE,
      month: "2026-05",
      excludeAppointmentId: APPT,
    });
    const r = parseAvailabilityDatesQuery(q);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.excludeAppointmentId).toBe(APPT);

    q.set("excludeAppointmentId", "not-uuid");
    const r2 = parseAvailabilityDatesQuery(q);
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.excludeAppointmentId).toBeUndefined();
  });
});

describe("parseAvailabilitySlotsQuery", () => {
  it("requires doctorId, date, typeId", () => {
    const ok = new URLSearchParams({
      doctorId: DOCTOR,
      date: "2026-05-25",
      typeId: TYPE,
    });
    expect(parseAvailabilitySlotsQuery(ok).ok).toBe(true);

    const bad = new URLSearchParams({ doctorId: DOCTOR, date: "2026-05-25" });
    expect(parseAvailabilitySlotsQuery(bad).ok).toBe(false);
  });
});
