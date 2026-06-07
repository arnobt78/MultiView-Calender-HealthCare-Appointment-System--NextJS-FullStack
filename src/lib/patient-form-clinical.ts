/**
 * Patient create/edit dialog — clinical_profile + form state helpers (list dialog + detail form).
 */

import type { PatientCreateInput } from "@/hooks/usePatients";
import type { Patient, PatientClinicalProfile } from "@/types/types";

export type PatientFormDialogExtra = {
  allergiesCsv: string;
  clinicalNotes: string;
  primaryDoctorId: string;
  referralSource: string;
  referralDetail: string;
};

export function clinicalProfileToDialogExtra(
  cp: PatientClinicalProfile | undefined
): Pick<PatientFormDialogExtra, "allergiesCsv" | "clinicalNotes" | "referralSource" | "referralDetail"> {
  const o = cp != null && typeof cp === "object" && !Array.isArray(cp) ? cp : {};
  const allergies = Array.isArray(o.allergies) ? (o.allergies as string[]).join(", ") : "";
  const notes = typeof o.notes === "string" ? o.notes : "";
  const referralSource =
    typeof o.referral_source === "string" && o.referral_source ? o.referral_source : "control_panel";
  const referralDetail = typeof o.referral_detail === "string" ? o.referral_detail : "";
  return { allergiesCsv: allergies, clinicalNotes: notes, referralSource, referralDetail };
}

/** Merge dialog clinical fields into existing profile (PUT preserves unrelated JSON keys). */
export function buildClinicalProfileFromDialogExtra(
  prev: PatientClinicalProfile | undefined,
  extra: Pick<PatientFormDialogExtra, "allergiesCsv" | "clinicalNotes" | "referralSource" | "referralDetail">
): PatientClinicalProfile {
  const base = prev && typeof prev === "object" && !Array.isArray(prev) ? { ...prev } : {};
  const allergies = extra.allergiesCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const notes = extra.clinicalNotes.trim();
  const detail =
    extra.referralSource === "external_partner" || extra.referralSource === "other"
      ? extra.referralDetail.trim()
      : "";
  const out: Record<string, unknown> = { ...base, referral_source: extra.referralSource };
  if (allergies.length) out.allergies = allergies;
  else delete out.allergies;
  if (notes) out.notes = notes;
  else delete out.notes;
  if (detail) out.referral_detail = detail;
  else delete out.referral_detail;
  return out as PatientClinicalProfile;
}

/** POST /api/patients — optional clinical_profile from add-dialog extras. */
export function buildCreateClinicalProfile(
  extra: Pick<PatientFormDialogExtra, "allergiesCsv" | "clinicalNotes" | "referralSource" | "referralDetail">
): PatientClinicalProfile | undefined {
  const allergies = extra.allergiesCsv.split(",").map((s) => s.trim()).filter(Boolean);
  const notes = extra.clinicalNotes.trim();
  const rd =
    extra.referralSource === "external_partner" || extra.referralSource === "other"
      ? extra.referralDetail.trim()
      : "";
  const o: Record<string, unknown> = { referral_source: extra.referralSource };
  if (allergies.length) o.allergies = allergies;
  if (notes) o.notes = notes;
  if (rd) o.referral_detail = rd;
  return Object.keys(o).length ? (o as PatientClinicalProfile) : undefined;
}

export function patientToDialogFormState(patient: Patient): PatientCreateInput {
  return {
    firstname: patient.firstname,
    lastname: patient.lastname,
    email: patient.email ?? "",
    phone: patient.phone ?? "",
    birth_date: patient.birth_date ?? "",
    care_level: patient.care_level ?? undefined,
    pronoun: patient.pronoun ?? "",
    active: patient.active,
  };
}

export function patientToDialogExtraState(patient: Patient): PatientFormDialogExtra {
  const clinical = clinicalProfileToDialogExtra(patient.clinical_profile);
  return {
    ...clinical,
    primaryDoctorId: patient.primary_doctor_id ?? "",
  };
}

export const EMPTY_PATIENT_DIALOG_FORM: PatientCreateInput = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  birth_date: "",
  care_level: undefined,
  pronoun: "",
  active: true,
};

export const EMPTY_PATIENT_DIALOG_EXTRA: PatientFormDialogExtra = {
  allergiesCsv: "",
  clinicalNotes: "",
  primaryDoctorId: "",
  referralSource: "control_panel",
  referralDetail: "",
};
