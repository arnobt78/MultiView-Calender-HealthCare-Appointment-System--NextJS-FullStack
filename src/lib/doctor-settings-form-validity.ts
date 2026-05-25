/**
 * Doctor settings add/edit forms — shared save-button enablement (Cancel stays clickable; see `DoctorSettingsFormActions`).
 */

import { datetimeLocalValueToIso } from "@/lib/datetime-local-value";
import { timeToMins } from "@/lib/doctor-schedule-display";

const APPT_TYPE_DURATION_MIN = 5;
const APPT_TYPE_DURATION_MAX = 720;

/** Weekly availability window — start strictly before end; optional IANA tz (falls back server-side). */
export function isValidWeeklyAvailabilityWindow(
  startTime: string,
  endTime: string,
  timezone?: string
): boolean {
  if (!startTime || !endTime) return false;
  const start = timeToMins(startTime);
  const end = timeToMins(endTime);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return false;
  if (timezone !== undefined && timezone.trim().length === 0) return false;
  return true;
}

/** Time-off block — both datetimes set, parseable, end after start. */
export function isValidTimeOffDatetimeRange(start: string, end: string): boolean {
  if (!start.trim() || !end.trim()) return false;
  const startMs = new Date(datetimeLocalValueToIso(start)).getTime();
  const endMs = new Date(datetimeLocalValueToIso(end)).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return false;
  return endMs > startMs;
}

/** Doctor-owned appointment type name + duration (minutes). */
export function isValidDoctorAppointmentTypeDraft(
  name: string,
  durationRaw: string
): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const duration = Number.parseInt(durationRaw, 10);
  if (!Number.isFinite(duration)) return false;
  return duration >= APPT_TYPE_DURATION_MIN && duration <= APPT_TYPE_DURATION_MAX;
}
