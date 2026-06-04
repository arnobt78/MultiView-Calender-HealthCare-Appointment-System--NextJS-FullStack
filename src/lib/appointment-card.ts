import type { FullAppointment } from "@/hooks/useAppointments";
import type { Patient } from "@/types/types";

/** Shared meta row group wrapper — dashboard list + patient portal timeline. */
export const appointmentCardMetaGroupClass =
  "flex min-w-0 flex-wrap items-center gap-x-4 text-xs text-gray-600";

/** Patient portal timeline — when/location can wrap on sm+; staff/category always stacked. */
export const portalAppointmentWhenWhereClass =
  "flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 text-xs text-gray-600";

export const portalAppointmentDetailStackClass =
  "flex w-full min-w-0 flex-col gap-2.5 text-xs text-gray-600";

/** Tailwind width for hover/popover surfaces — fixed so text wraps with break-words inside. */
export const APPOINTMENT_CARD_POPOVER_WIDTH = "w-[320px]";

export const APPOINTMENT_CARD_POPOVER_MAX_WIDTH = "max-w-[calc(100vw-2rem)]";

/** Below this slot height (day/week grid), show compact meta; below minimal threshold, title only. */
export const COMPACT_SLOT_HEIGHT_PX = 56;

export const MINIMAL_SLOT_HEIGHT_PX = 40;

export type AppointmentCardVariant =
  | "list"
  | "month-panel"
  | "popover"
  | "compact"
  | "minimal";

export type AppointmentCardDensity = "full" | "compact" | "minimal";

export function deriveCardDensity({
  variant,
  slotHeightPx,
  densityOverride,
}: {
  variant: AppointmentCardVariant;
  slotHeightPx?: number;
  densityOverride?: AppointmentCardDensity;
}): AppointmentCardDensity {
  if (densityOverride) return densityOverride;
  if (variant === "list" || variant === "month-panel" || variant === "popover") {
    return "full";
  }
  if (variant === "minimal") return "minimal";
  if (variant === "compact") {
    if (slotHeightPx != null && slotHeightPx < MINIMAL_SLOT_HEIGHT_PX) return "minimal";
    return "compact";
  }
  if (slotHeightPx != null) {
    if (slotHeightPx < MINIMAL_SLOT_HEIGHT_PX) return "minimal";
    if (slotHeightPx < COMPACT_SLOT_HEIGHT_PX) return "compact";
    return "full";
  }
  return "full";
}

export function resolvePatientDisplayName(
  appointment: Pick<FullAppointment, "patient" | "patient_data">,
  patients: Patient[]
): string {
  const embedded = appointment.patient_data;
  if (embedded?.firstname && embedded?.lastname) {
    return `${embedded.firstname} ${embedded.lastname}`;
  }
  if (
    appointment.patient &&
    typeof appointment.patient === "object" &&
    "firstname" in appointment.patient &&
    "lastname" in appointment.patient
  ) {
    const p = appointment.patient as Patient;
    return `${p.firstname} ${p.lastname}`;
  }
  if (typeof appointment.patient === "string" && appointment.patient) {
    const p = patients.find((x) => x.id === appointment.patient);
    if (p?.firstname && p?.lastname) return `${p.firstname} ${p.lastname}`;
  }
  return "--";
}

export function resolvePatientId(
  appointment: Pick<FullAppointment, "patient" | "patient_data">
): string | null {
  if (typeof appointment.patient === "string" && appointment.patient) {
    return appointment.patient;
  }
  if (appointment.patient_data?.id) return appointment.patient_data.id;
  if (
    appointment.patient &&
    typeof appointment.patient === "object" &&
    "id" in appointment.patient
  ) {
    return (appointment.patient as Patient).id;
  }
  return null;
}

export function statusTextClass(status: string | null | undefined): string {
  if (status === "done") return "text-green-600";
  if (status === "alert") return "text-red-500";
  return "text-amber-600";
}

/** Clinician user ids to resolve via `useOwnerUserSummaries` (calendar owner + treating + patient primary doctor). */
export function collectAppointmentClinicianUserIds(
  appointments: {
    user_id: string;
    treating_physician_id?: string | null;
    patient_data?: Patient | null;
  }[]
): string[] {
  const ids = new Set<string>();
  for (const a of appointments) {
    ids.add(a.user_id);
    const treating = a.treating_physician_id?.trim();
    if (treating) ids.add(treating);
    const primary = a.patient_data?.primary_doctor_id?.trim();
    if (primary) ids.add(primary);
  }
  return [...ids];
}

/** @deprecated Use `collectAppointmentClinicianUserIds`. */
export const collectAppointmentStaffUserIds = collectAppointmentClinicianUserIds;

export function categorySwatchFill(color: string | null | undefined): string {
  if (!color?.trim()) return "#94a3b8";
  const hex = color.trim();
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex) ? hex : "#94a3b8";
}
