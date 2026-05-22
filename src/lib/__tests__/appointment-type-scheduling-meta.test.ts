import { describe, expect, it } from "vitest";
import {
  formatAppointmentTypeBufferLine,
  formatAppointmentTypeChipMeta,
  formatAppointmentTypeSchedulingBracket,
  formatAppointmentTypeSlotStepLine,
} from "@/lib/appointment-type-scheduling-meta";

describe("appointment-type-scheduling-meta", () => {
  it("formats chip meta for custom type with buffer", () => {
    expect(
      formatAppointmentTypeChipMeta({
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
        is_global: false,
      })
    ).toBe("Custom · buf 5+5m · step 30m");
  });

  it("shows buffer line when buffers set", () => {
    expect(
      formatAppointmentTypeBufferLine({
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
      })
    ).toContain("Buffer:");
  });

  it("formats patient-friendly confirm bracket", () => {
    expect(
      formatAppointmentTypeSchedulingBracket({
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
      })
    ).toBe("5 min buffer before and 5 min after · slots every 30 min");
  });

  it("shows slot step line when buffers are zero", () => {
    expect(
      formatAppointmentTypeSlotStepLine({
        duration_minutes: 40,
        buffer_before_minutes: 0,
        buffer_after_minutes: 0,
        slot_interval_minutes: 30,
      })
    ).toContain("Slot step");
  });
});
