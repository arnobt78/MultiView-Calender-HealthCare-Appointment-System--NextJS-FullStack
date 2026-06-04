import { describe, expect, it } from "vitest";
import { canShowAppointmentClinicalNotes } from "@/lib/portal-appointment-card-visibility";

describe("canShowAppointmentClinicalNotes", () => {
  it("allows admin and doctor only", () => {
    expect(canShowAppointmentClinicalNotes("admin")).toBe(true);
    expect(canShowAppointmentClinicalNotes("doctor")).toBe(true);
    expect(canShowAppointmentClinicalNotes("patient")).toBe(false);
    expect(canShowAppointmentClinicalNotes(null)).toBe(false);
  });
});
