/**
 * ICS import helpers — treating physician resolution for POST /api/calendar/import.
 */

import { isValidUUID } from "@/lib/validation";

/** Advanced import may assign treating physician; default falls back to session user. */
export function resolveCalendarImportTreatingPhysicianId(
  formValue: FormDataEntryValue | null,
  sessionUserId: string
): string {
  if (typeof formValue === "string") {
    const trimmed = formValue.trim();
    if (trimmed && isValidUUID(trimmed)) {
      return trimmed;
    }
  }
  return sessionUserId;
}
