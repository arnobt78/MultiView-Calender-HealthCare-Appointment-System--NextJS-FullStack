/**
 * Dashboard overview queue cards — shared Prisma select + JSON mappers (API + SSR prefetch).
 */

import type { Prisma } from "@prisma/client";

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

/** Appointment fields for Next + Recently Created panels. */
export const dashboardOverviewAppointmentQueueSelect = {
  id: true,
  title: true,
  start: true,
  end: true,
  location: true,
  status: true,
  is_telehealth: true,
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
    },
  },
} satisfies Prisma.AppointmentSelect;

export type DashboardOverviewQueueDoctor = {
  id: string;
  display_name: string | null;
  email: string;
  image: string | null;
  specialty: string | null;
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
  patient: DashboardOverviewQueuePatient | null;
  treatingDoctor: DashboardOverviewQueueDoctor | null;
};

type AppointmentQueueRow = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string | null;
  status: string | null;
  is_telehealth: boolean;
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
  doctor: NonNullable<AppointmentQueueRow["treating_physician"]>
): DashboardOverviewQueueDoctor {
  return {
    id: doctor.id,
    display_name: doctor.display_name,
    email: doctor.email,
    image: doctor.image,
    specialty: doctor.specialty,
  };
}

export function mapDashboardOverviewQueueAppointment(
  row: AppointmentQueueRow
): DashboardOverviewQueueAppointment {
  return {
    id: row.id,
    title: row.title,
    start: row.start.toISOString(),
    end: row.end.toISOString(),
    location: row.location,
    status: row.status,
    is_telehealth: row.is_telehealth === true,
    patient: row.patient ? mapPatient(row.patient) : null,
    treatingDoctor: row.treating_physician ? mapDoctor(row.treating_physician) : null,
  };
}
