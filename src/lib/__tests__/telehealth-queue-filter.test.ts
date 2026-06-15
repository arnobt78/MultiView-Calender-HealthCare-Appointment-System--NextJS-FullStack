import { describe, it, expect } from "vitest";
import {
  isTelehealthQueueAppointment,
  filterTelehealthQueueAppointments,
  resolveTelehealthUpNext,
  isTelehealthSessionInProgress,
} from "@/lib/telehealth-queue-filter";
import type { FullAppointment } from "@/hooks/useAppointments";

function appt(overrides: Partial<FullAppointment> & { id: string; start: string; end: string }): FullAppointment {
  return {
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
    location: null,
    patient: null,
    attachments: [],
    category: null,
    notes: null,
    title: "Visit",
    status: "pending",
    user_id: "user-1",
    ...overrides,
  } as FullAppointment;
}

describe("isTelehealthQueueAppointment", () => {
  it("returns true only when is_telehealth is true", () => {
    expect(isTelehealthQueueAppointment({ is_telehealth: true })).toBe(true);
    expect(isTelehealthQueueAppointment({ is_telehealth: false })).toBe(false);
    expect(isTelehealthQueueAppointment({})).toBe(false);
  });
});

describe("filterTelehealthQueueAppointments", () => {
  const followUp = appt({
    id: "1",
    start: new Date().toISOString(),
    end: new Date(Date.now() + 3_600_000).toISOString(),
    is_telehealth: false,
    title: "Follow-up",
  });
  const teleToday = appt({
    id: "2",
    start: new Date().toISOString(),
    end: new Date(Date.now() + 1_800_000).toISOString(),
    is_telehealth: true,
    title: "Video visit",
  });

  it("excludes non-telehealth visits", () => {
    const result = filterTelehealthQueueAppointments([followUp, teleToday], "all");
    expect(result.map((a) => a.id)).toEqual(["2"]);
  });

  it("filters today tab", () => {
    const result = filterTelehealthQueueAppointments([teleToday], "today");
    expect(result).toHaveLength(1);
  });
});

describe("resolveTelehealthUpNext", () => {
  it("picks earliest non-done future-end telehealth visit", () => {
    const later = appt({
      id: "a",
      start: new Date(Date.now() + 3_600_000).toISOString(),
      end: new Date(Date.now() + 5_400_000).toISOString(),
      is_telehealth: true,
    });
    const sooner = appt({
      id: "b",
      start: new Date(Date.now() + 600_000).toISOString(),
      end: new Date(Date.now() + 2_400_000).toISOString(),
      is_telehealth: true,
    });
    expect(resolveTelehealthUpNext([later, sooner])?.id).toBe("b");
  });

  it("ignores in-person visits", () => {
    const inPerson = appt({
      id: "c",
      start: new Date().toISOString(),
      end: new Date(Date.now() + 1_800_000).toISOString(),
      is_telehealth: false,
    });
    expect(resolveTelehealthUpNext([inPerson])).toBeNull();
  });
});

describe("isTelehealthSessionInProgress", () => {
  it("returns true when now is between start and end", () => {
    const live = appt({
      id: "live",
      start: new Date(Date.now() - 60_000).toISOString(),
      end: new Date(Date.now() + 60_000).toISOString(),
      is_telehealth: true,
    });
    expect(isTelehealthSessionInProgress(live)).toBe(true);
  });
});
