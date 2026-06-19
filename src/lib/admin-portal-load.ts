/**
 * Shared load for GET /api/admin-portal — API route + SSR prefetchAdminPortal.
 * Single Prisma bundle: overview KPIs, doctor directory, appointments (cap 100), revenue aggregates.
 */

import { startOfDay, endOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  APPOINTMENT_TYPE_CARD_SELECT,
  appointmentTypeSerializedFields,
} from "@/lib/appointment-type-include";
import { serializeAppointment } from "@/lib/serializers";
import type {
  AdminPortalAppointmentRow,
  AdminPortalData,
  AppointmentType,
  DoctorRow,
} from "@/types/types";

/** Max appointments returned in one admin-portal payload (sorted by start desc). */
export const ADMIN_PORTAL_APPOINTMENT_LIST_LIMIT = 100;

/** Client pagination page size — slice only, no extra DB round-trips. */
export const ADMIN_PORTAL_APPOINTMENTS_PAGE_SIZE = 25;

const DOCTOR_SELECT = {
  id: true,
  email: true,
  display_name: true,
  image: true,
  specialty: true,
  bio: true,
  phone: true,
  license_number: true,
  consultation_fee: true,
  languages_spoken: true,
  years_of_experience: true,
  office_location: true,
  department: true,
  created_at: true,
  doctor_availabilities: {
    select: { weekday: true, start_min: true, end_min: true, timezone: true },
  },
  appointment_types_owned: {
    where: { is_active: true },
    select: {
      id: true,
      name: true,
      duration_minutes: true,
      is_telehealth: true,
      price_cents: true,
    },
  },
  patients_primary_doctor: { select: { id: true } },
} as const;

const CLINICIAN_EMBED_SELECT = {
  id: true,
  display_name: true,
  email: true,
  image: true,
  specialty: true,
  role: true,
  consultation_fee: true,
} as const;

const APPOINTMENT_LIST_INCLUDE = {
  patient: {
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      clinical_profile: true,
    },
  },
  owner: { select: CLINICIAN_EMBED_SELECT },
  treating_physician: { select: CLINICIAN_EMBED_SELECT },
  category: { select: { id: true, label: true, color: true, icon: true } },
  appointment_type: { select: APPOINTMENT_TYPE_CARD_SELECT },
} as const;

type DoctorDbRow = Awaited<
  ReturnType<typeof prisma.user.findMany<{ select: typeof DOCTOR_SELECT }>>
>[number];

type AppointmentDbRow = Awaited<
  ReturnType<
    typeof prisma.appointment.findMany<{ include: typeof APPOINTMENT_LIST_INCLUDE }>
  >
>[number];

function mapDoctorRow(d: DoctorDbRow): DoctorRow {
  return {
    id: d.id,
    email: d.email,
    display_name: d.display_name,
    image: d.image,
    specialty: d.specialty,
    bio: d.bio,
    phone: d.phone,
    license_number: d.license_number,
    consultation_fee: d.consultation_fee,
    languages_spoken: d.languages_spoken,
    years_of_experience: d.years_of_experience,
    office_location: d.office_location,
    department: d.department,
    created_at: d.created_at.toISOString(),
    availabilities: d.doctor_availabilities,
    appointment_types: d.appointment_types_owned as Pick<
      AppointmentType,
      "id" | "name" | "duration_minutes" | "is_telehealth" | "price_cents"
    >[],
    patient_count: d.patients_primary_doctor.length,
  };
}

function mapAppointmentRow(row: AppointmentDbRow): AdminPortalAppointmentRow {
  const feeDoc = row.treating_physician ?? row.owner;
  const patient = row.patient;
  const patientName = patient
    ? `${patient.firstname} ${patient.lastname}`.trim() || patient.email
    : null;

  const base = serializeAppointment({
    ...row,
    ...appointmentTypeSerializedFields(row.appointment_type),
    doctor_consultation_fee_cents: feeDoc?.consultation_fee ?? null,
  });

  return {
    ...base,
    patient_name: patientName,
    patient_email: patient?.email ?? null,
    patient_image:
      (patient?.clinical_profile as { image_url?: string } | null | undefined)?.image_url ??
      null,
    category_data: row.category
      ? {
          id: row.category.id,
          label: row.category.label ?? "",
          color: row.category.color,
          icon: row.category.icon,
        }
      : null,
    owner_clinician: row.owner
      ? {
          id: row.owner.id,
          display_name: row.owner.display_name,
          email: row.owner.email,
          image: row.owner.image,
          specialty: row.owner.specialty,
          role: row.owner.role,
        }
      : null,
    treating_clinician: row.treating_physician
      ? {
          id: row.treating_physician.id,
          display_name: row.treating_physician.display_name,
          email: row.treating_physician.email,
          image: row.treating_physician.image,
          specialty: row.treating_physician.specialty,
          role: row.treating_physician.role,
        }
      : null,
    owner_display: row.owner?.display_name ?? row.owner?.email ?? null,
  };
}

/** Clinic-wide admin portal payload — mirrors GET /api/admin-portal JSON shape. */
export async function fetchAdminPortalData(): Promise<AdminPortalData> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    overdueAppointments,
    totalPatients,
    totalDoctors,
    doctors,
    appointmentRows,
    paidRevenueAgg,
    outstandingRevenueAgg,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({ where: { start: { gte: todayStart, lte: todayEnd } } }),
    prisma.appointment.count({ where: { status: "pending" } }),
    prisma.appointment.count({ where: { end: { lt: now }, status: { not: "done" } } }),
    prisma.patient.count(),
    prisma.user.count({ where: { role: "doctor" } }),
    prisma.user.findMany({
      where: { role: "doctor" },
      select: DOCTOR_SELECT,
      orderBy: { display_name: "asc" },
    }),
    prisma.appointment.findMany({
      orderBy: { start: "desc" },
      take: ADMIN_PORTAL_APPOINTMENT_LIST_LIMIT,
      include: APPOINTMENT_LIST_INCLUDE,
    }),
    prisma.invoice.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
    prisma.invoice.aggregate({
      where: { status: { in: ["draft", "sent"] } },
      _sum: { amount: true },
    }),
  ]);

  const appointments = appointmentRows.map(mapAppointmentRow);

  return {
    overview: {
      totalAppointments,
      todayAppointments,
      totalPatients,
      totalDoctors,
      pendingAppointments,
      overdueAppointments,
      paidRevenueCents: paidRevenueAgg._sum.amount ?? 0,
      outstandingRevenueCents: outstandingRevenueAgg._sum.amount ?? 0,
    },
    doctors: doctors.map(mapDoctorRow),
    recentAppointments: appointments,
    appointments,
    appointmentTotal: appointments.length,
  };
}
