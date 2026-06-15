/**
 * Telehealth queue — client filter on shared appointments cache.
 * Only `is_telehealth === true` visits belong on this tab (not in-person follow-ups).
 */

import { isFuture, isToday } from "date-fns";
import type { FullAppointment } from "@/hooks/useAppointments";

export type TelehealthQueueDateFilter = "today" | "upcoming" | "all";

/** True when appointment is a video/telehealth visit. */
export function isTelehealthQueueAppointment(appt: { is_telehealth?: boolean }): boolean {
  return appt.is_telehealth === true;
}

function passesDateFilter(start: string, dateFilter: TelehealthQueueDateFilter): boolean {
  const startDate = new Date(start);
  if (dateFilter === "today") return isToday(startDate);
  if (dateFilter === "upcoming") return isFuture(startDate);
  return true;
}

/** Telehealth-only list sorted by start ascending. */
export function filterTelehealthQueueAppointments(
  appointments: FullAppointment[] | null | undefined,
  dateFilter: TelehealthQueueDateFilter
): FullAppointment[] {
  if (!appointments?.length) return [];
  return appointments
    .filter((appt) => isTelehealthQueueAppointment(appt))
    .filter((appt) => passesDateFilter(appt.start, dateFilter))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/** All telehealth visits (no date tab) — for KPI stats. */
export function filterTelehealthAppointmentsOnly(
  appointments: FullAppointment[] | null | undefined
): FullAppointment[] {
  if (!appointments?.length) return [];
  return appointments.filter((appt) => isTelehealthQueueAppointment(appt));
}

/** Next live telehealth session: not done, not ended, earliest start. */
export function resolveTelehealthUpNext(
  appointments: FullAppointment[] | null | undefined
): FullAppointment | null {
  if (!appointments?.length) return null;
  const nowStr = new Date().toISOString();
  const candidates = appointments
    .filter((appt) => isTelehealthQueueAppointment(appt))
    .filter((appt) => appt.status !== "done" && new Date(appt.end).toISOString() > nowStr)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return candidates[0] ?? null;
}

export function isTelehealthSessionInProgress(appt: FullAppointment): boolean {
  const now = Date.now();
  return (
    new Date(appt.start).getTime() <= now && new Date(appt.end).getTime() > now
  );
}

export function isTelehealthSessionEnded(appt: FullAppointment): boolean {
  return new Date(appt.end).getTime() <= Date.now();
}
