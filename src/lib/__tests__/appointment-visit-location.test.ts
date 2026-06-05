import { describe, expect, it } from "vitest";
import {
  resolveAppointmentDisplayLocation,
  resolveAppointmentVisitLocationLabel,
  resolvePatientBookingPersistedLocation,
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

  it("persisted booking location skips telehealth", () => {
    expect(resolvePatientBookingPersistedLocation(true, "Demo Clinic")).toBeNull();
    expect(resolvePatientBookingPersistedLocation(false, "Demo Clinic")).toBe("Demo Clinic");
  });
});
