import { describe, expect, it } from "vitest";
import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDisplayName,
  resolveAppointmentTypeDurationMinutes,
  shouldShowAppointmentCategoryTypeRow,
} from "@/lib/appointment-type-display";

describe("appointment-type-display", () => {
  it("prefers FK name over title parsing", () => {
    expect(
      resolveAppointmentTypeDisplayName({
        appointment_type_name: "Follow-up Visit",
        title: "Demo — Initial Consultation",
      })
    ).toBe("Follow-up Visit");
  });

  it("parses type from title when FK name missing", () => {
    expect(
      resolveAppointmentTypeDisplayName({
        title: "Curated demo — Follow-up Visit",
      })
    ).toBe("Follow-up Visit");
  });

  it("uses booked duration before type default", () => {
    expect(
      resolveAppointmentTypeDurationMinutes({
        duration_minutes: 45,
        appointment_type_duration_minutes: 30,
      })
    ).toBe(45);
  });

  it("formats duration label", () => {
    expect(formatAppointmentTypeDurationLabel(30)).toBe("30 min");
    expect(formatAppointmentTypeDurationLabel(null)).toBeNull();
  });

  it("shows meta row when type or fee present without category", () => {
    expect(
      shouldShowAppointmentCategoryTypeRow({ appointment_type_name: "Follow-up" }, 0)
    ).toBe(true);
    expect(shouldShowAppointmentCategoryTypeRow({}, 15000)).toBe(true);
    expect(shouldShowAppointmentCategoryTypeRow({}, 0)).toBe(false);
  });
});
