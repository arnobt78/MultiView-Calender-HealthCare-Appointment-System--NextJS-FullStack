import { describe, expect, it } from "vitest";
import {
  canAdvanceFromStep,
  createInitialBookingState,
  getBackStep,
  getNextStep,
  shouldFetchAvailabilitySlots,
  shouldShowConfirmSection,
  shouldShowScheduleSection,
  type PatientBookingWizardState,
} from "@/lib/patient-booking-wizard";

const baseState = (): PatientBookingWizardState => ({
  doctorId: "doc-1",
  selectedType: {
    id: "type-1",
    name: "Follow-up Visit",
    duration_minutes: 30,
    buffer_before_minutes: 5,
    buffer_after_minutes: 5,
    slot_interval_minutes: 15,
    minimum_notice_minutes: 60,
    user_id: "doc-1",
  },
  flexDuration: 30,
  dateStr: "2026-05-26",
  selectedSlot: "2026-05-26T11:00:00.000Z",
  title: "Follow-up Visit",
  notes: "",
  isFlexible: false,
  typesLoading: false,
});

describe("createInitialBookingState", () => {
  it("seeds doctor from services preselect", () => {
    const s = createInitialBookingState("pre-doc");
    expect(s.doctorId).toBe("pre-doc");
  });
});

describe("canAdvanceFromStep", () => {
  it("step 1 requires doctor and type when not flexible", () => {
    const s = baseState();
    s.selectedType = null;
    expect(canAdvanceFromStep(1, s)).toBe(false);
    s.selectedType = baseState().selectedType;
    expect(canAdvanceFromStep(1, s)).toBe(true);
  });

  it("step 1 allows flexible without selected type", () => {
    const s = baseState();
    s.isFlexible = true;
    s.selectedType = null;
    expect(canAdvanceFromStep(1, s)).toBe(true);
  });

  it("step 2 typed path requires date and slot", () => {
    const s = baseState();
    s.selectedSlot = null;
    expect(canAdvanceFromStep(2, s)).toBe(false);
    s.selectedSlot = "2026-05-26T11:00:00.000Z";
    expect(canAdvanceFromStep(2, s)).toBe(true);
  });

  it("step 2 flexible only requires date", () => {
    const s = baseState();
    s.isFlexible = true;
    s.selectedSlot = null;
    expect(canAdvanceFromStep(2, s)).toBe(true);
  });
});

describe("getNextStep", () => {
  it("advances 1 to 2", () => {
    expect(getNextStep(1, baseState())).toBe(2);
  });

  it("flexible skips from 2 to 4", () => {
    const s = baseState();
    s.isFlexible = true;
    expect(getNextStep(2, s)).toBe(4);
  });

  it("typed goes 2 to 3", () => {
    expect(getNextStep(2, baseState())).toBe(3);
  });
});

describe("getBackStep", () => {
  it("returns null on step 1", () => {
    expect(getBackStep(1, baseState())).toBeNull();
  });

  it("flexible back from 4 goes to 2", () => {
    const s = baseState();
    s.isFlexible = true;
    expect(getBackStep(4, s)).toBe(2);
  });

  it("typed back from 4 goes to 3", () => {
    expect(getBackStep(4, baseState())).toBe(3);
  });
});

describe("section visibility", () => {
  it("schedule from step 2 onward", () => {
    expect(shouldShowScheduleSection(1)).toBe(false);
    expect(shouldShowScheduleSection(2)).toBe(true);
    expect(shouldShowScheduleSection(3)).toBe(true);
  });

  it("confirm from step 4 only", () => {
    expect(shouldShowConfirmSection(3)).toBe(false);
    expect(shouldShowConfirmSection(4)).toBe(true);
  });
});

describe("shouldFetchAvailabilitySlots", () => {
  it("enabled when doctor date and type set", () => {
    expect(shouldFetchAvailabilitySlots(baseState())).toBe(true);
  });

  it("disabled for flexible bookings", () => {
    const s = baseState();
    s.isFlexible = true;
    expect(shouldFetchAvailabilitySlots(s)).toBe(false);
  });

  it("disabled while types loading", () => {
    const s = baseState();
    s.typesLoading = true;
    expect(shouldFetchAvailabilitySlots(s)).toBe(false);
  });
});
