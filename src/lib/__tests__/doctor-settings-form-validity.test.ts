import { describe, expect, it } from "vitest";
import {
  isValidDoctorAppointmentTypeDraft,
  isValidTimeOffDatetimeRange,
  isValidWeeklyAvailabilityWindow,
} from "@/lib/doctor-settings-form-validity";

describe("doctor-settings-form-validity", () => {
  it("weekly window requires start before end", () => {
    expect(isValidWeeklyAvailabilityWindow("09:00", "17:00", "Europe/Berlin")).toBe(true);
    expect(isValidWeeklyAvailabilityWindow("17:00", "09:00", "Europe/Berlin")).toBe(false);
    expect(isValidWeeklyAvailabilityWindow("", "17:00")).toBe(false);
  });

  it("time off requires end after start", () => {
    expect(isValidTimeOffDatetimeRange("2026-07-25T10:00", "2026-07-26T10:00")).toBe(true);
    expect(isValidTimeOffDatetimeRange("2026-07-26T10:00", "2026-07-25T10:00")).toBe(false);
  });

  it("appointment type draft enforces duration bounds", () => {
    expect(isValidDoctorAppointmentTypeDraft("Follow-up", "30")).toBe(true);
    expect(isValidDoctorAppointmentTypeDraft("  ", "30")).toBe(false);
    expect(isValidDoctorAppointmentTypeDraft("X", "4")).toBe(false);
    expect(isValidDoctorAppointmentTypeDraft("X", "721")).toBe(false);
  });
});
