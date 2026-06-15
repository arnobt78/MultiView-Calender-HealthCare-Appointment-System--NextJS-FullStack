/**
 * Map FullAppointment → dashboard identity DTOs for telehealth queue rows.
 */

import type { FullAppointment } from "@/hooks/useAppointments";
import { resolveTreatingPhysicianUserId } from "@/lib/appointment-display-doctor";
import { resolveAppointmentDisplayLocation } from "@/lib/appointment-visit-location";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import type {
  DashboardOverviewQueueDoctor,
  DashboardOverviewQueuePatient,
} from "@/lib/dashboard-overview-queue";
import type { PortalAppointmentClinicianUser } from "@/lib/serializers";

function mapPortalClinician(
  clinician: PortalAppointmentClinicianUser | null | undefined
): DashboardOverviewQueueDoctor | null {
  if (!clinician?.id) return null;
  return {
    id: clinician.id,
    display_name: clinician.display_name,
    email: clinician.email,
    image: clinician.image ?? null,
    specialty: clinician.specialty ?? null,
    office_location: clinician.office_location ?? null,
  };
}

export function mapTelehealthQueuePatient(
  appointment: FullAppointment
): DashboardOverviewQueuePatient | null {
  const patient = appointment.patient_data;
  if (!patient?.id) return null;
  const first = patient.firstname?.trim() ?? "";
  const last = patient.lastname?.trim() ?? "";
  const name = `${first} ${last}`.trim() || patient.email?.trim() || "Client";
  return {
    id: patient.id,
    name,
    email: patient.email ?? null,
    birth_date: patient.birth_date ?? null,
    care_level: patient.care_level ?? null,
    clinical_profile: patient.clinical_profile ?? null,
  };
}

function mapDirectoryDoctor(row: DoctorDirectoryRow): DashboardOverviewQueueDoctor {
  return {
    id: row.id,
    display_name: row.display_name,
    email: row.email,
    image: row.image ?? null,
    specialty: row.specialty ?? null,
    office_location: row.office_location ?? null,
  };
}

export function mapTelehealthQueueTreatingDoctor(
  appointment: FullAppointment,
  /** Staff CP list — `GET /api/doctors` cache (`queryKeys.doctors.all`). */
  doctors?: DoctorDirectoryRow[] | null
): DashboardOverviewQueueDoctor | null {
  const portal = mapPortalClinician(appointment.portal_treating_physician);
  if (portal) return portal;

  const physicianId = resolveTreatingPhysicianUserId(appointment);
  const fromDirectory = doctors?.find((d) => d.id === physicianId);
  if (fromDirectory) return mapDirectoryDoctor(fromDirectory);

  const ownerPortal = mapPortalClinician(appointment.portal_owner);
  if (ownerPortal && ownerPortal.id === physicianId) return ownerPortal;
  if (ownerPortal && !appointment.treating_physician_id) return ownerPortal;
  return ownerPortal;
}

export type TelehealthQueueCategory = {
  id: string;
  label: string;
  color: string | null;
  icon: string | null;
};

export function mapTelehealthQueueCategory(
  appointment: FullAppointment
): TelehealthQueueCategory | null {
  const cat = appointment.category_data;
  if (!cat) return null;
  const id = cat.id?.trim();
  const label = cat.label?.trim();
  if (!id || !label) return null;
  return {
    id,
    label,
    color: cat.color ?? null,
    icon: cat.icon ?? null,
  };
}

export function mapTelehealthQueueCalendarOwner(
  appointment: FullAppointment
): DashboardOverviewQueueDoctor | null {
  return mapPortalClinician(appointment.portal_owner);
}

export function resolveTelehealthQueuePhysicalLocation(
  appointment: FullAppointment
): string | null {
  const raw = appointment.location?.trim();
  if (!raw || raw === "—") return null;
  if (/telehealth|video call|video visit/i.test(raw)) return null;
  return raw;
}

/** True when visit-type chip duplicates page-level telehealth labeling. */
export function isRedundantTelehealthVisitTypeLabel(label: string | null | undefined): boolean {
  const normalized = label?.trim().toLowerCase() ?? "";
  if (!normalized) return true;
  return (
    normalized === "telehealth" ||
    normalized === "telehealth session" ||
    normalized === "telehealth visit"
  );
}

export function resolveTelehealthQueueDisplayLocation(appointment: FullAppointment): string {
  const physical = resolveTelehealthQueuePhysicalLocation(appointment);
  if (physical) return physical;
  return (
    resolveAppointmentDisplayLocation({
      location: appointment.location,
      is_telehealth: appointment.is_telehealth,
      treating_physician: appointment.portal_treating_physician
        ? { office_location: appointment.portal_treating_physician.office_location ?? null }
        : null,
      owner: appointment.portal_owner
        ? { office_location: appointment.portal_owner.office_location ?? null }
        : null,
    }) ?? ""
  );
}

export function resolveTelehealthVisitTypeLabel(appointment: FullAppointment): string {
  return appointment.appointment_type_name?.trim() || "Telehealth visit";
}

export function resolveTelehealthDurationMinutes(appointment: FullAppointment): number {
  const fromFields = appointment.duration_minutes ?? appointment.appointment_type_duration_minutes;
  if (fromFields != null && fromFields > 0) return fromFields;
  const start = new Date(appointment.start).getTime();
  const end = new Date(appointment.end).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / 60_000);
}
