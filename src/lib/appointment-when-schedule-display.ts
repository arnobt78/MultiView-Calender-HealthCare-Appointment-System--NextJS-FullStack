/**
 * When-column schedule display — normalizes appointment / snapshot rows for
 * `AppointmentWhenScheduleCell` (visit type + duration + telehealth inline).
 */
import type { FullAppointment } from "@/hooks/useAppointments";
import type { AppointmentTypeDisplaySource } from "@/lib/appointment-type-display";
import type { AppointmentSnapshotRow } from "@/types/types";

export type AppointmentWhenScheduleSource = AppointmentTypeDisplaySource & {
  start: string;
  end?: string | null;
  location?: string | null;
  is_telehealth?: boolean;
};

export function toWhenScheduleSourceFromAppointment(
  appointment: FullAppointment
): AppointmentWhenScheduleSource {
  return {
    start: appointment.start,
    end: appointment.end,
    location: appointment.location,
    is_telehealth: appointment.is_telehealth,
    appointment_type_name: appointment.appointment_type_name,
    title: appointment.title,
    duration_minutes: appointment.duration_minutes,
    appointment_type_duration_minutes: appointment.appointment_type_duration_minutes,
  };
}

export function toWhenScheduleSourceFromSnapshot(
  row: AppointmentSnapshotRow
): AppointmentWhenScheduleSource {
  return {
    start: row.start,
    end: row.end,
    location: row.location,
    is_telehealth: row.is_telehealth,
    appointment_type_name: row.appointment_type_name,
    title: row.title,
    duration_minutes: row.duration_minutes,
    appointment_type_duration_minutes: row.appointment_type_duration_minutes,
  };
}

/** Resolve display location — telehealth rows skip redundant location line when empty. */
export function resolveWhenScheduleLocationLabel(
  source: Pick<AppointmentWhenScheduleSource, "location" | "is_telehealth">
): string | null {
  const loc = source.location?.trim();
  if (!loc) return null;
  if (source.is_telehealth && /telehealth|video call/i.test(loc)) return null;
  return loc;
}
