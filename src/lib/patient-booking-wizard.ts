/**
 * Pure helpers for patient portal booking wizard — shared by dialog UI and unit tests.
 */

export type PatientBookingStep = 1 | 2 | 3 | 4;

export type PatientBookingAppointmentType = {
  id: string;
  name: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  minimum_notice_minutes: number;
  user_id: string | null;
};

export type PatientBookingWizardState = {
  doctorId: string;
  selectedType: PatientBookingAppointmentType | null;
  flexDuration: number;
  dateStr: string;
  selectedSlot: string | null;
  title: string;
  notes: string;
  isFlexible: boolean;
  typesLoading: boolean;
};

export const PATIENT_BOOKING_STEP_LABELS = [
  "Doctor & Type",
  "Date",
  "Time Slot",
  "Details",
] as const;

export const PATIENT_BOOKING_DIALOG_DESC_ID = "patient-booking-dialog-desc";

/** Initial wizard fields when dialog opens or closes. */
export function createInitialBookingState(preselectedDoctorId?: string): PatientBookingWizardState {
  return {
    doctorId: preselectedDoctorId ?? "",
    selectedType: null,
    flexDuration: 30,
    dateStr: "",
    selectedSlot: null,
    title: "",
    notes: "",
    isFlexible: false,
    typesLoading: false,
  };
}

/** Whether the sticky footer primary action is enabled for the current step. */
export function canAdvanceFromStep(
  step: PatientBookingStep,
  state: PatientBookingWizardState
): boolean {
  switch (step) {
    case 1:
      return Boolean(state.doctorId) && (state.isFlexible || Boolean(state.selectedType));
    case 2:
      if (!state.dateStr) return false;
      if (state.isFlexible) return true;
      return Boolean(state.selectedSlot);
    case 3:
      return Boolean(state.selectedSlot);
    case 4:
      return Boolean(state.title && state.selectedSlot);
    default:
      return false;
  }
}

/** Next step index after primary footer action (not used on step 4). */
export function getNextStep(
  step: PatientBookingStep,
  state: PatientBookingWizardState
): PatientBookingStep {
  if (step === 1) return 2;
  if (step === 2) {
    if (state.isFlexible) return 4;
    return state.selectedSlot ? 3 : 3;
  }
  if (step === 3) return 4;
  return 4;
}

/** Previous step for footer Back. */
export function getBackStep(
  step: PatientBookingStep,
  state: PatientBookingWizardState
): PatientBookingStep | null {
  if (step === 1) return null;
  if (step === 4) return state.isFlexible ? 2 : 3;
  if (step === 3) return 2;
  if (step === 2) return 1;
  return null;
}

/**
 * Which body sections stay mounted in the progressive stack.
 * Step 3 only advances stepper; schedule block remains visible from step 2 onward.
 */
export function shouldShowScheduleSection(step: PatientBookingStep): boolean {
  return step >= 2;
}

export function shouldShowConfirmSection(step: PatientBookingStep): boolean {
  return step >= 4;
}

/** Slots query should run when doctor, date, and type are known (not tied to step index). */
export function shouldFetchAvailabilitySlots(state: PatientBookingWizardState): boolean {
  return (
    !state.isFlexible &&
    !state.typesLoading &&
    Boolean(state.doctorId && state.dateStr && state.selectedType?.id)
  );
}
