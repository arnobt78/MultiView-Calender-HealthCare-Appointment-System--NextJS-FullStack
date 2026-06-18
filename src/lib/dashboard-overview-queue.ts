/**
 * Dashboard overview queue cards — shared Prisma select + JSON mappers (API + SSR prefetch).
 */

import type { Prisma } from "@prisma/client";
import { APPOINTMENT_TYPE_CARD_SELECT, appointmentTypeSerializedFields } from "@/lib/appointment-type-include";
import {
  resolveAppointmentActivityAt,
  resolveAppointmentActivityKind,
  type DashboardAppointmentActivityKind,
} from "@/lib/dashboard-overview-recent-activity";

/** Upcoming queue on dashboard overview (closest future starts first). */
export const DASHBOARD_UPCOMING_APPOINTMENTS_LIMIT = 5;

/** Redis/TanStack payloads may still carry legacy `nextAppointment` until TTL expires. */
export function coerceDashboardOverviewUpcomingAppointments<
  T extends {
    upcomingAppointments?: DashboardOverviewQueueAppointment[];
    nextAppointment?: DashboardOverviewQueueAppointment | null;
  },
>(payload: T): T & { upcomingAppointments: DashboardOverviewQueueAppointment[] } {
  if (Array.isArray(payload.upcomingAppointments)) {
    return payload as T & { upcomingAppointments: DashboardOverviewQueueAppointment[] };
  }
  return {
    ...payload,
    upcomingAppointments: payload.nextAppointment ? [payload.nextAppointment] : [],
  };
}

/** Legacy Redis rows may lack activity fields until TTL expires. */
function normalizeRecentQueueRow(
  row: DashboardOverviewQueueAppointment | DashboardOverviewRecentQueueAppointment
): DashboardOverviewRecentQueueAppointment {
  const recent = row as DashboardOverviewRecentQueueAppointment;
  if (recent.activityKind && recent.activityAt && recent.actor) return recent;
  const actor =
    recent.actor ??
    recent.treatingDoctor ?? {
      id: "unknown",
      display_name: "Unknown",
      email: "",
      image: null,
      specialty: null,
    };
  return {
    ...row,
    activityKind: recent.activityKind ?? "created",
    activityAt: recent.activityAt ?? row.start,
    actor,
  };
}

/** Normalizes overview API/prefetch payload (upcoming + recent activity rows). */
export function coerceDashboardOverviewPayload<
  T extends {
    upcomingAppointments?: DashboardOverviewQueueAppointment[];
    nextAppointment?: DashboardOverviewQueueAppointment | null;
    recentAppointments?: (DashboardOverviewQueueAppointment | DashboardOverviewRecentQueueAppointment)[];
  },
>(
  payload: T
): T & {
  upcomingAppointments: DashboardOverviewQueueAppointment[];
  recentAppointments: DashboardOverviewRecentQueueAppointment[];
} {
  const withUpcoming = coerceDashboardOverviewUpcomingAppointments(payload);
  const recent = Array.isArray(withUpcoming.recentAppointments)
    ? withUpcoming.recentAppointments.map(normalizeRecentQueueRow)
    : [];
  return { ...withUpcoming, recentAppointments: recent };
}

/** Appointment fields for Next + Recently Created panels. */
export const dashboardOverviewAppointmentQueueSelect = {
  id: true,
  title: true,
  start: true,
  end: true,
  location: true,
  status: true,
  is_telehealth: true,
  duration_minutes: true,
  appointment_type: { select: APPOINTMENT_TYPE_CARD_SELECT },
  patient: {
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      birth_date: true,
      care_level: true,
      clinical_profile: true,
    },
  },
  treating_physician: {
    select: {
      id: true,
      display_name: true,
      email: true,
      image: true,
      specialty: true,
      office_location: true,
    },
  },
  owner: {
    select: {
      id: true,
      display_name: true,
      email: true,
      image: true,
      specialty: true,
      office_location: true,
    },
  },
} satisfies Prisma.AppointmentSelect;

export type DashboardOverviewQueueDoctor = {
  id: string;
  display_name: string | null;
  email: string;
  image: string | null;
  specialty: string | null;
  office_location?: string | null;
};

/** Calendar owner shown as Created/Updated actor on recent-activity rows. */
export type DashboardOverviewQueueActor = DashboardOverviewQueueDoctor;

export type DashboardOverviewRecentQueueAppointment = DashboardOverviewQueueAppointment & {
  activityKind: DashboardAppointmentActivityKind;
  activityAt: string;
  actor: DashboardOverviewQueueActor;
};

export type DashboardOverviewQueuePatient = {
  id: string;
  name: string;
  email: string | null;
  birth_date: string | null;
  care_level: number | null;
  clinical_profile: { image_url?: string } | null;
};

export type DashboardOverviewQueueAppointment = {
  id: string;
  title: string;
  start: string;
  end: string;
  location: string | null;
  status: string | null;
  is_telehealth: boolean;
  appointment_type_name: string | null;
  duration_minutes: number | null;
  appointment_type_duration_minutes: number | null;
  patient: DashboardOverviewQueuePatient | null;
  treatingDoctor: DashboardOverviewQueueDoctor | null;
  /** Calendar owner — office fallback when `location` unset (legacy rows). */
  calendarOwner: DashboardOverviewQueueDoctor | null;
};

type AppointmentQueueRow = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string | null;
  status: string | null;
  is_telehealth: boolean;
  duration_minutes: number | null;
  appointment_type: {
    name: string;
    price_cents: number;
    duration_minutes: number | null;
  } | null;
  patient: {
    id: string;
    firstname: string;
    lastname: string;
    email: string | null;
    birth_date: Date | null;
    care_level: number | null;
    clinical_profile: unknown;
  } | null;
  treating_physician: {
    id: string;
    display_name: string | null;
    email: string;
    image: string | null;
    specialty: string | null;
    office_location: string | null;
  } | null;
  owner: {
    id: string;
    display_name: string | null;
    email: string;
    image: string | null;
    specialty: string | null;
    office_location: string | null;
  } | null;
};

function mapPatient(
  patient: NonNullable<AppointmentQueueRow["patient"]>
): DashboardOverviewQueuePatient {
  const clinical =
    patient.clinical_profile &&
    typeof patient.clinical_profile === "object" &&
    !Array.isArray(patient.clinical_profile)
      ? (patient.clinical_profile as { image_url?: string })
      : null;
  return {
    id: patient.id,
    name: `${patient.firstname} ${patient.lastname}`.trim(),
    email: patient.email,
    birth_date: patient.birth_date?.toISOString() ?? null,
    care_level: patient.care_level,
    clinical_profile: clinical,
  };
}

function mapDoctor(
  doctor: NonNullable<AppointmentQueueRow["treating_physician"] | AppointmentQueueRow["owner"]>
): DashboardOverviewQueueDoctor {
  return {
    id: doctor.id,
    display_name: doctor.display_name,
    email: doctor.email,
    image: doctor.image,
    specialty: doctor.specialty,
    office_location: doctor.office_location,
  };
}

export function mapDashboardOverviewQueueAppointment(
  row: AppointmentQueueRow
): DashboardOverviewQueueAppointment {
  const typeFields = appointmentTypeSerializedFields(row.appointment_type);
  return {
    id: row.id,
    title: row.title,
    start: row.start.toISOString(),
    end: row.end.toISOString(),
    location: row.location,
    status: row.status,
    is_telehealth: row.is_telehealth === true,
    appointment_type_name: typeFields.appointment_type_name,
    duration_minutes: row.duration_minutes,
    appointment_type_duration_minutes: typeFields.appointment_type_duration_minutes,
    patient: row.patient ? mapPatient(row.patient) : null,
    treatingDoctor: row.treating_physician ? mapDoctor(row.treating_physician) : null,
    calendarOwner: row.owner ? mapDoctor(row.owner) : null,
  };
}

type RecentAppointmentQueueRow = AppointmentQueueRow & {
  created_at: Date;
  updated_at: Date | null;
  owner: {
    id: string;
    display_name: string | null;
    email: string;
    image: string | null;
    specialty: string | null;
  };
};

function mapActor(owner: RecentAppointmentQueueRow["owner"]): DashboardOverviewQueueActor {
  return {
    id: owner.id,
    display_name: owner.display_name,
    email: owner.email,
    image: owner.image,
    specialty: owner.specialty,
  };
}

/** Recent panel row — base appointment fields + latest create/update activity metadata. */
export function mapDashboardOverviewRecentQueueAppointment(
  row: RecentAppointmentQueueRow
): DashboardOverviewRecentQueueAppointment {
  return {
    ...mapDashboardOverviewQueueAppointment(row),
    activityKind: resolveAppointmentActivityKind(row),
    activityAt: resolveAppointmentActivityAt(row).toISOString(),
    actor: mapActor(row.owner),
  };
}
