import { differenceInYears, isValid, parseISO } from "date-fns";

/** Whole years from an ISO birth date (YYYY-MM-DD); null if missing or invalid. */
export function patientAgeYears(birthDate: string | null | undefined): number | null {
  if (!birthDate?.trim()) return null;
  const d = parseISO(birthDate.length === 10 ? `${birthDate}T12:00:00` : birthDate);
  if (!isValid(d)) return null;
  const y = differenceInYears(new Date(), d);
  return y >= 0 ? y : null;
}
