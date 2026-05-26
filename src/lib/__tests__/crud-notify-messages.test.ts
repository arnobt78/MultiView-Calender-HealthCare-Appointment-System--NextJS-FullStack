import { describe, expect, it } from "vitest";
import {
  globalVisitTypeCrudMessage,
  globalVisitTypeToggleMessage,
  isOwnedVisitTypeActiveOnlyPatch,
  ownedVisitTypeCrudMessage,
  patientBookingCreatedMessage,
  timeOffCrudMessage,
  weeklyAvailabilityCrudMessage,
} from "@/lib/crud-notify-messages";

describe("weeklyAvailabilityCrudMessage", () => {
  const input = { weekday: 1, start_min: 540, end_min: 1020, timezone: "Europe/Berlin" };

  it("formats create with day, range, and timezone", () => {
    const msg = weeklyAvailabilityCrudMessage("created", input);
    expect(msg.action).toBe("created");
    expect(msg.detail).toContain("Monday");
    expect(msg.detail).toContain("09:00–17:00");
    expect(msg.detail).toContain("Europe/Berlin");
    expect(msg.detail).toContain("added to weekly hours");
  });

  it("formats delete", () => {
    const msg = weeklyAvailabilityCrudMessage("deleted", input);
    expect(msg.action).toBe("deleted");
    expect(msg.detail).toContain("removed from weekly hours");
  });
});

describe("timeOffCrudMessage", () => {
  const range = {
    starts_at: "2026-07-25T12:37:00.000Z",
    ends_at: "2026-07-26T12:37:00.000Z",
  };

  it("includes formatted range on create", () => {
    const msg = timeOffCrudMessage("created", range);
    expect(msg.detail).toMatch(/Jul 25, 2026/);
    expect(msg.detail).toContain("added to your schedule");
  });

  it("appends reason when provided", () => {
    const msg = timeOffCrudMessage("deleted", { ...range, reason: "Vacation" });
    expect(msg.detail).toContain("removed from your schedule");
    expect(msg.detail).toContain('"Vacation"');
  });
});

describe("globalVisitTypeToggleMessage", () => {
  it("portal enabled includes type name", () => {
    const msg = globalVisitTypeToggleMessage({
      name: "Initial Consultation",
      enabled: true,
      variant: "portal",
    });
    expect(msg.detail).toBe('"Initial Consultation" enabled for your patients.');
    expect(msg.action).toBe("created");
  });

  it("portal disabled includes type name", () => {
    const msg = globalVisitTypeToggleMessage({
      name: "Follow-up Visit",
      enabled: false,
      variant: "portal",
    });
    expect(msg.detail).toBe('"Follow-up Visit" disabled for new bookings.');
    expect(msg.action).toBe("deleted");
  });
});

describe("ownedVisitTypeCrudMessage", () => {
  it("create includes name and duration", () => {
    const msg = ownedVisitTypeCrudMessage({
      kind: "create",
      name: "Physio Therapy",
      duration_minutes: 30,
    });
    expect(msg.detail).toContain('"Physio Therapy"');
    expect(msg.detail).toContain("30 min");
  });

  it("toggle inactive", () => {
    const msg = ownedVisitTypeCrudMessage({
      kind: "toggle-active",
      name: "Physio Therapy",
      is_active: false,
    });
    expect(msg.detail).toBe('"Physio Therapy" disabled for new bookings.');
  });

  it("toggle active", () => {
    const msg = ownedVisitTypeCrudMessage({
      kind: "toggle-active",
      name: "Physio Therapy",
      is_active: true,
    });
    expect(msg.detail).toBe('"Physio Therapy" enabled for new bookings.');
  });
});

describe("isOwnedVisitTypeActiveOnlyPatch", () => {
  it("detects is_active-only patch", () => {
    expect(isOwnedVisitTypeActiveOnlyPatch({ is_active: false })).toBe(true);
    expect(isOwnedVisitTypeActiveOnlyPatch({ is_active: false, name: "X" })).toBe(false);
  });
});

describe("patientBookingCreatedMessage", () => {
  it("includes doctor, type, and slot", () => {
    const msg = patientBookingCreatedMessage({
      doctorName: "Dr. Smith",
      typeName: "Follow-up Visit",
      start: new Date("2026-05-25T08:00:00"),
      end: new Date("2026-05-25T08:30:00"),
    });
    expect(msg.entity).toBe("Appointment request");
    expect(msg.detail).toContain("Dr. Smith");
    expect(msg.detail).toContain("Follow-up Visit");
    expect(msg.detail).toMatch(/25 May 2026/);
  });
});

describe("globalVisitTypeCrudMessage", () => {
  it("create mentions all doctors", () => {
    const msg = globalVisitTypeCrudMessage("created", {
      name: "Telehealth Session",
      duration_minutes: 20,
    });
    expect(msg.detail).toContain("Telehealth Session");
    expect(msg.detail).toContain("all doctors");
  });
});
