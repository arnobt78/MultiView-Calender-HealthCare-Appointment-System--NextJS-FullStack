import { patientAgeYears } from "@/lib/patient-age";
import { getPatientCareLevelShortLabel } from "@/lib/patient-care-level";
import type { Patient } from "@/types/types";

export type PatientSelectDisplayInput = Pick<
  Patient,
  | "id"
  | "firstname"
  | "lastname"
  | "email"
  | "birth_date"
  | "care_level"
  | "clinical_profile"
  | "primary_doctor_display"
  | "primary_doctor_email"
>;

/** Full name for selects and `textValue` search. */
export function patientSelectDisplayName(p: PatientSelectDisplayInput): string {
  const name = `${p.firstname ?? ""} ${p.lastname ?? ""}`.trim();
  return name || p.email?.trim() || "Patient";
}

/** Primary doctor line — display name preferred, email fallback. */
export function patientSelectPrimaryDoctorLabel(p: PatientSelectDisplayInput): string {
  const name = p.primary_doctor_display?.trim();
  if (name) return name;
  return p.primary_doctor_email?.trim() || "No primary doctor";
}

/** Radix Select `textValue` — name, age, tier, and doctor for typeahead/filter. */
export function patientSelectSearchText(p: PatientSelectDisplayInput): string {
  const age = patientAgeYears(p.birth_date);
  const tier = getPatientCareLevelShortLabel(p.care_level);
  const doctor = patientSelectPrimaryDoctorLabel(p);
  const agePart = age != null ? `${age} years` : "";
  return [patientSelectDisplayName(p), agePart, tier, doctor].filter(Boolean).join(" ");
}
