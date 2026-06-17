/**
 * Map appointment detail view-model → `FullAppointment` for `AppointmentDialog` edit mode.
 * Calendar/list edit uses `enrichFullAppointmentDialogSeeds` for the same instant picker seeds.
 */
import type { FullAppointment } from "@/hooks/useAppointments";
import type {
  AppointmentDetailClinician,
  AppointmentDetailViewModel,
} from "@/lib/appointment-detail-view-model";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import type { VisitTypePickerItem } from "@/components/shared/scheduling/VisitTypePickerList";
import type { PortalAppointmentClinicianUser } from "@/lib/serializers";
import type { Appointment, AppointmentAssignee } from "@/types/types";

/** Minimal directory row from SSR detail clinician — instant picker label before `doctors.all` hydrates. */
export function mapDetailClinicianToDirectoryRow(
  clinician: AppointmentDetailClinician
): DoctorDirectoryRow {
  return {
    id: clinician.id,
    email: clinician.email,
    display_name: clinician.display_name,
    image: clinician.image,
    specialty: clinician.specialty,
    availabilities: [],
    appointment_types: [],
    bookable_appointment_types: [],
    consultation_fee: clinician.consultation_fee,
  };
}

/** Portal join row → minimal directory seed when `doctors.all` is not yet warm. */
export function mapPortalClinicianToDirectoryRow(
  portal: PortalAppointmentClinicianUser
): DoctorDirectoryRow {
  return {
    id: portal.id,
    email: portal.email,
    display_name: portal.display_name,
    image: portal.image ?? null,
    specialty: portal.specialty ?? null,
    availabilities: [],
    appointment_types: [],
    bookable_appointment_types: [],
    consultation_fee: portal.consultation_fee ?? null,
  };
}

/** Visit type summary from list/detail appointment row — instant before `appointmentTypes.byDoctor` hydrates. */
export function buildVisitTypeSeedFromAppointmentRow(
  appt: Pick<
    Appointment,
    "appointment_type_id" | "appointment_type_name" | "appointment_type_duration_minutes"
  >
): VisitTypePickerItem | undefined {
  if (!appt.appointment_type_id || !appt.appointment_type_name) return undefined;
  return {
    id: appt.appointment_type_id,
    name: appt.appointment_type_name,
    duration_minutes: appt.appointment_type_duration_minutes ?? 30,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    slot_interval_minutes: 15,
  };
}

/**
 * Client-side seed enrichment for calendar/list edit — idempotent when SSR seeds already set.
 * Prefers full `doctors.all` row over portal minimal row when cache is warm.
 */
export function enrichFullAppointmentDialogSeeds(
  appt: FullAppointment,
  doctors?: readonly DoctorDirectoryRow[] | null
): FullAppointment {
  let treating_physician_directory_seed = appt.treating_physician_directory_seed;
  let appointment_type_visit_seed = appt.appointment_type_visit_seed;

  if (!appointment_type_visit_seed) {
    appointment_type_visit_seed = buildVisitTypeSeedFromAppointmentRow(appt);
  }

  if (!treating_physician_directory_seed) {
    const physicianId = appt.treating_physician_id;
    if (physicianId && doctors?.length) {
      treating_physician_directory_seed = doctors.find((d) => d.id === physicianId);
    }
    if (!treating_physician_directory_seed && appt.portal_treating_physician) {
      treating_physician_directory_seed = mapPortalClinicianToDirectoryRow(
        appt.portal_treating_physician
      );
    }
  }

  if (
    treating_physician_directory_seed === appt.treating_physician_directory_seed &&
    appointment_type_visit_seed === appt.appointment_type_visit_seed
  ) {
    return appt;
  }

  return {
    ...appt,
    treating_physician_directory_seed,
    appointment_type_visit_seed,
  };
}

export function buildFullAppointmentForDialog(
  detail: AppointmentDetailViewModel,
  assignees: AppointmentAssignee[]
): FullAppointment {
  const treatingSeed = detail.treatingPhysician
    ? mapDetailClinicianToDirectoryRow(detail.treatingPhysician)
    : undefined;

  const appt = detail.appointment;
  const visitTypeSeed = buildVisitTypeSeedFromAppointmentRow(appt);

  return {
    ...appt,
    patient_data: detail.patient ?? undefined,
    category_data: detail.category ?? undefined,
    appointment_assignee: assignees.length > 0 ? assignees : undefined,
    treating_physician_directory_seed: treatingSeed,
    appointment_type_visit_seed: visitTypeSeed,
  };
}
