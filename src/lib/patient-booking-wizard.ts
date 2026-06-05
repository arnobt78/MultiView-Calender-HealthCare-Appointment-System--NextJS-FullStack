/**
 * Pure helpers for patient portal booking wizard — shared by dialog UI and unit tests.
 * Three steps: Doctor & Type → Date & Time → Details (one panel per step index).
 */

export type PatientBookingStep = 1 | 2 | 3;

export type PatientBookingAppointmentType = {
  id: string;
  name: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  minimum_notice_minutes: number;
  user_id: string | null;
  /** Visit fee in cents — shown in booking dialog; 0 = no explicit price set. */
  price_cents?: number;
  /** Drives telehealth badge + omits physical location in booking preview. */
  is_telehealth?: boolean;
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
  "Date & Time",
  "Details",
] as const;

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

/** Step 3 “reason for visit” default — typed name or flexible duration label. */
export function defaultPatientBookingReasonForVisit(
  state: Pick<PatientBookingWizardState, "selectedType" | "isFlexible" | "flexDuration">
): string {
  if (state.isFlexible) {
    return `Flexible booking · ${state.flexDuration} min`;
  }
  return state.selectedType?.name?.trim() ?? "";
}

/**
 * Re-apply visit-type default when landing on step 3 if the field is empty or still shows the prior seed
 * (patient went Back and changed visit type).
 */
export function shouldReseedPatientBookingReason(
  currentTitle: string,
  lastSeededTitle: string
): boolean {
  const trimmed = currentTitle.trim();
  if (!trimmed) return true;
  const prior = lastSeededTitle.trim();
  return Boolean(prior) && trimmed === prior;
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
      return Boolean(
        state.title &&
          state.selectedSlot &&
          (state.isFlexible || Boolean(state.selectedType))
      );
    default:
      return false;
  }
}

/** Next step after footer primary (step 3 is submit only). */
export function getNextStep(
  step: PatientBookingStep,
  _state: PatientBookingWizardState
): PatientBookingStep {
  if (step === 1) return 2;
  return 3;
}

/** Previous step for footer Back. */
export function getBackStep(step: PatientBookingStep): PatientBookingStep | null {
  if (step === 1) return null;
  if (step === 3) return 2;
  if (step === 2) return 1;
  return null;
}

/** Step 1 panel — doctor directory + visit type. */
export function shouldShowDoctorTypeSection(step: PatientBookingStep): boolean {
  return step === 1;
}

/** Step 2 panel — date + availability slots (or flexible date only). */
export function shouldShowScheduleSection(step: PatientBookingStep): boolean {
  return step === 2;
}

/** Step 3 panel — summary, title, notes, flexible start time. */
export function shouldShowConfirmSection(step: PatientBookingStep): boolean {
  return step === 3;
}

/** Slots query when doctor, date, and type are known (not tied to step index). */
export function shouldFetchAvailabilitySlots(state: PatientBookingWizardState): boolean {
  return (
    !state.isFlexible &&
    !state.typesLoading &&
    Boolean(state.doctorId && state.dateStr && state.selectedType?.id)
  );
}
