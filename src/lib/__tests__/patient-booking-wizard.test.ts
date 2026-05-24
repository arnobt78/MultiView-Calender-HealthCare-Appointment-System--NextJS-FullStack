import { describe, expect, it } from "vitest";
import {
  canAdvanceFromStep,
  createInitialBookingState,
  defaultPatientBookingReasonForVisit,
  getBackStep,
  getNextStep,
  shouldReseedPatientBookingReason,
  shouldFetchAvailabilitySlots,
  shouldShowConfirmSection,
  shouldShowDoctorTypeSection,
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

describe("defaultPatientBookingReasonForVisit", () => {
  it("uses visit type name when typed", () => {
    expect(defaultPatientBookingReasonForVisit(baseState())).toBe("Follow-up Visit");
  });

  it("uses flexible label when no types", () => {
    const s = baseState();
    s.isFlexible = true;
    s.selectedType = null;
    s.flexDuration = 45;
    expect(defaultPatientBookingReasonForVisit(s)).toBe("Flexible booking · 45 min");
  });
});

describe("shouldReseedPatientBookingReason", () => {
  it("reseeds when empty", () => {
    expect(shouldReseedPatientBookingReason("", "Follow-up Visit")).toBe(true);
  });

  it("reseeds when still prior seed", () => {
    expect(shouldReseedPatientBookingReason("Follow-up Visit", "Follow-up Visit")).toBe(true);
  });

  it("keeps custom text", () => {
    expect(shouldReseedPatientBookingReason("Knee pain", "Follow-up Visit")).toBe(false);
  });
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

  it("step 3 requires title, slot, and type (or flexible)", () => {
    const s = baseState();
    s.title = "";
    s.selectedSlot = "2026-05-21T10:00:00.000Z";
    expect(canAdvanceFromStep(3, s)).toBe(false);
    s.title = "Visit";
    expect(canAdvanceFromStep(3, s)).toBe(true);
    s.selectedType = null;
    s.isFlexible = true;
    expect(canAdvanceFromStep(3, s)).toBe(true);
  });
});

describe("getNextStep", () => {
  it("advances 1 to 2", () => {
    expect(getNextStep(1, baseState())).toBe(2);
  });

  it("advances 2 to 3 for typed and flexible", () => {
    expect(getNextStep(2, baseState())).toBe(3);
    const s = baseState();
    s.isFlexible = true;
    expect(getNextStep(2, s)).toBe(3);
  });
});

describe("getBackStep", () => {
  it("returns null on step 1", () => {
    expect(getBackStep(1)).toBeNull();
  });

  it("back from 3 goes to 2", () => {
    expect(getBackStep(3)).toBe(2);
  });

  it("back from 2 goes to 1", () => {
    expect(getBackStep(2)).toBe(1);
  });
});

describe("section visibility", () => {
  it("one panel per step", () => {
    expect(shouldShowDoctorTypeSection(1)).toBe(true);
    expect(shouldShowDoctorTypeSection(2)).toBe(false);
    expect(shouldShowScheduleSection(1)).toBe(false);
    expect(shouldShowScheduleSection(2)).toBe(true);
    expect(shouldShowScheduleSection(3)).toBe(false);
    expect(shouldShowConfirmSection(2)).toBe(false);
    expect(shouldShowConfirmSection(3)).toBe(true);
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
