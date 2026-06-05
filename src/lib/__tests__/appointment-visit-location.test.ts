import { describe, expect, it } from "vitest";
import {
  resolveAppointmentDisplayLocation,
  resolveAppointmentVisitLocationLabel,
  resolvePatientBookingPersistedLocation,
  resolveSnapshotAppointmentDisplayLocation,
} from "@/lib/appointment-visit-location";

describe("appointment-visit-location", () => {
  it("telehealth returns null by default", () => {
    expect(
      resolveAppointmentVisitLocationLabel({
        location: "Demo Clinic",
        is_telehealth: true,
      })
    ).toBeNull();
  });

  it("telehealth placeholder for billing", () => {
    expect(
      resolveAppointmentVisitLocationLabel(
        { location: "Demo Clinic", is_telehealth: true },
        { telehealthPlaceholder: "Video call (telehealth)" }
      )
    ).toBe("Video call (telehealth)");
  });

  it("falls back to office_location when appointment.location empty", () => {
    expect(
      resolveAppointmentDisplayLocation({
        location: null,
        is_telehealth: false,
        treating_physician: { office_location: "Demo Clinic — Room 1" },
      })
    ).toBe("Demo Clinic — Room 1");
  });

  it("snapshot table falls back to treating physician office", () => {
    expect(
      resolveSnapshotAppointmentDisplayLocation({
        location: null,
        is_telehealth: false,
        treating_physician_office_location: "Room 12 — Demo Clinic",
      })
    ).toBe("Room 12 — Demo Clinic");
  });

  it("persisted booking location skips telehealth", () => {
    expect(resolvePatientBookingPersistedLocation(true, "Demo Clinic")).toBeNull();
    expect(resolvePatientBookingPersistedLocation(false, "Demo Clinic")).toBe("Demo Clinic");
  });
});
