/**
 * Doctor portal settings SSR — mirrors GET availability, time-off, and appointment-types?doctorId=
 * Cache shapes match TanStack keys used by doctor-settings editors.
 */

import { prisma } from "@/lib/prisma";
import type { AppointmentTypeApiRow } from "@/hooks/useAppointmentTypes";
import type { AvailabilityWindow, TimeOffBlock } from "@/lib/doctor-schedule-types";

export type DoctorAvailabilityQueryData = { availability: AvailabilityWindow[] };
export type DoctorTimeOffQueryData = { timeOff: TimeOffBlock[] };

/** Matches `GET /api/appointment-types?doctorId=` payload (globals include `is_enabled`). */
export type DoctorAppointmentTypesQueryData = {
  types: Array<
    AppointmentTypeApiRow & {
      is_telehealth?: boolean;
      color?: string | null;
      icon?: string | null;
      is_active?: boolean;
      is_enabled?: boolean;
    }
  >;
};

export type DoctorPortalSettingsPrefetch = {
  availability: DoctorAvailabilityQueryData;
  timeOff: DoctorTimeOffQueryData;
  appointmentTypes: DoctorAppointmentTypesQueryData;
};

/** Prisma → API row shape for `queryKeys.appointmentTypes.byDoctor`. */
async function loadAppointmentTypesForDoctor(
  doctorId: string
): Promise<DoctorAppointmentTypesQueryData> {
  const types = await prisma.appointmentType.findMany({
    where: {
      OR: [{ user_id: doctorId }, { user_id: null }],
      is_active: true,
    },
    include: {
      doctor_configs: {
        where: { doctor_id: doctorId },
        select: { is_enabled: true },
      },
    },
    orderBy: [{ user_id: "desc" }, { name: "asc" }],
  });

  return {
    types: types.map((t) => ({
      id: t.id,
      created_at: t.created_at.toISOString(),
      user_id: t.user_id,
      name: t.name,
      description: t.description,
      duration_minutes: t.duration_minutes,
      buffer_before_minutes: t.buffer_before_minutes,
      buffer_after_minutes: t.buffer_after_minutes,
      slot_interval_minutes: t.slot_interval_minutes,
      minimum_notice_minutes: t.minimum_notice_minutes,
      is_telehealth: t.is_telehealth,
      color: t.color,
      icon: t.icon,
      is_active: t.is_active,
      is_enabled: t.user_id === doctorId ? true : (t.doctor_configs[0]?.is_enabled ?? true),
    })),
  };
}

/**
 * SSR bundle for `/doctor-portal` schedule + visit-type panels.
 * Best-effort: returns null if DB unavailable (client hooks refetch).
 */
export async function prefetchDoctorPortalSettings(
  doctorId: string
): Promise<DoctorPortalSettingsPrefetch | null> {
  try {
    const [availabilityRows, timeOffRows, appointmentTypes] = await Promise.all([
      prisma.doctorAvailability.findMany({
        where: { user_id: doctorId },
        orderBy: [{ weekday: "asc" }, { start_min: "asc" }],
      }),
      prisma.doctorTimeOff.findMany({
        where: { user_id: doctorId },
        orderBy: { starts_at: "asc" },
      }),
      loadAppointmentTypesForDoctor(doctorId),
    ]);

    return {
      availability: {
        availability: availabilityRows.map((row) => ({
          id: row.id,
          weekday: row.weekday,
          start_min: row.start_min,
          end_min: row.end_min,
          timezone: row.timezone,
        })),
      },
      timeOff: {
        timeOff: timeOffRows.map((row) => ({
          id: row.id,
          starts_at: row.starts_at.toISOString(),
          ends_at: row.ends_at.toISOString(),
          reason: row.reason,
        })),
      },
      appointmentTypes,
    };
  } catch {
    return null;
  }
}
