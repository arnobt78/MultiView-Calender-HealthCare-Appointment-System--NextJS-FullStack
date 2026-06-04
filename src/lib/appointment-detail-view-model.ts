/**
 * Appointment detail SSR + TanStack cache view-model — maps Prisma row to UI-ready shape.
 */
import { differenceInMinutes } from "date-fns";
import type { AppointmentAccessLevel, AppointmentDetailRaw } from "@/lib/appointment-access";
import {
  formatVisitFeeEurLabel,
  resolveDisplayedVisitFeeCents,
} from "@/lib/appointment-visit-fee-display";
import { formatClinicianNameEmailLabel } from "@/lib/portal-appointment";
import {
  serializeAppointment,
  serializeCategory,
  serializePatient,
} from "@/lib/serializers";
import type { EntityRole } from "@/lib/entity-routes";
import type { Appointment, Category, Patient } from "@/types/types";

export type AppointmentDetailClinician = {
  id: string;
  display_name: string | null;
  email: string;
  role: string | null;
  image: string | null;
  specialty: string | null;
  consultation_fee: number | null;
};

export type AppointmentDetailAssigneeRow = {
  id: string;
  permission: string | null;
  status: string | null;
  invited_email: string | null;
  displayLabel: string;
  userId: string | null;
  image: string | null;
};

export type AppointmentDetailViewModel = {
  appointmentId: string;
  accessLevel: AppointmentAccessLevel;
  viewerRole: EntityRole;
  appointment: Appointment;
  patient: Patient | null;
  category: Category | null;
  calendarOwner: AppointmentDetailClinician | null;
  treatingPhysician: AppointmentDetailClinician | null;
  assignees: AppointmentDetailAssigneeRow[];
  visitFeeCents: number;
  visitFeeLabel: string;
  durationMinutes: number | null;
  /** Page header subtitle — when line + patient label. */
  subtitle: string;
  patientSubtitleLabel: string | null;
};

function mapClinician(
  row: {
    id: string;
    email: string;
    display_name: string | null;
    image: string | null;
    role: string | null;
    specialty: string | null;
    consultation_fee: number | null;
  } | null
): AppointmentDetailClinician | null {
  if (!row) return null;
  return {
    id: row.id,
    display_name: row.display_name,
    email: row.email,
    role: row.role,
    image: row.image,
    specialty: row.specialty,
    consultation_fee: row.consultation_fee,
  };
}

function resolveDurationMinutes(raw: AppointmentDetailRaw, appointment: Appointment): number | null {
  if (appointment.duration_minutes != null && appointment.duration_minutes > 0) {
    return appointment.duration_minutes;
  }
  if (appointment.appointment_type_duration_minutes != null) {
    return appointment.appointment_type_duration_minutes;
  }
  try {
    const mins = differenceInMinutes(new Date(raw.end), new Date(raw.start));
    return mins > 0 ? mins : null;
  } catch {
    return null;
  }
}

/** Build cached appointment detail payload from access resolver row. */
export function buildAppointmentDetailViewModel(
  raw: AppointmentDetailRaw,
  viewerRole: EntityRole,
  accessLevel: AppointmentAccessLevel
): AppointmentDetailViewModel {
  const appointment = serializeAppointment({
    ...raw,
    appointment_type_price_cents: raw.appointment_type?.price_cents ?? null,
    appointment_type_name: raw.appointment_type?.name ?? null,
    appointment_type_duration_minutes: raw.appointment_type?.duration_minutes ?? null,
    doctor_consultation_fee_cents:
      raw.treating_physician?.consultation_fee ?? raw.owner?.consultation_fee ?? null,
  });

  const patient = raw.patient ? serializePatient(raw.patient) : null;
  const category = raw.category ? serializeCategory(raw.category) : null;
  const calendarOwner = mapClinician(raw.owner);
  const treatingPhysician = mapClinician(raw.treating_physician);

  const visitFeeCents = resolveDisplayedVisitFeeCents({
    typePriceCents: appointment.appointment_type_price_cents,
    doctorConsultationFeeCents: appointment.doctor_consultation_fee_cents,
  });

  const patientSubtitleLabel = patient
    ? `${patient.firstname} ${patient.lastname}`.trim() || patient.email || null
    : null;

  const whenLabel = appointment.start
    ? new Date(appointment.start).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;
  const subtitle =
    patientSubtitleLabel && whenLabel
      ? `${patientSubtitleLabel} · ${whenLabel}`
      : patientSubtitleLabel ?? whenLabel ?? appointment.title;

  const assignees: AppointmentDetailAssigneeRow[] = (raw.assignees ?? []).map((a) => ({
    id: a.id,
    permission: a.permission,
    status: a.status,
    invited_email: a.invited_email,
    userId: a.user_id,
    image: a.user?.image ?? null,
    displayLabel:
      a.user?.display_name?.trim() ||
      a.user?.email ||
      a.invited_email ||
      "—",
  }));

  return {
    appointmentId: raw.id,
    accessLevel,
    viewerRole,
    appointment,
    patient,
    category,
    calendarOwner,
    treatingPhysician,
    assignees,
    visitFeeCents,
    visitFeeLabel: formatVisitFeeEurLabel(visitFeeCents),
    durationMinutes: resolveDurationMinutes(raw, appointment),
    subtitle,
    patientSubtitleLabel,
  };
}

export function clinicianDisplayLabel(c: AppointmentDetailClinician | null): string {
  if (!c) return "—";
  return formatClinicianNameEmailLabel(c.display_name, c.email);
}

/** Merge list-row appointment fields into detail cache after calendar mutations. */
export function mergeAppointmentIntoDetailViewModel(
  model: AppointmentDetailViewModel,
  appointment: Appointment
): AppointmentDetailViewModel {
  const visitFeeCents = resolveDisplayedVisitFeeCents({
    typePriceCents: appointment.appointment_type_price_cents,
    doctorConsultationFeeCents: appointment.doctor_consultation_fee_cents,
  });
  return {
    ...model,
    appointment,
    visitFeeCents,
    visitFeeLabel: formatVisitFeeEurLabel(visitFeeCents),
  };
}
