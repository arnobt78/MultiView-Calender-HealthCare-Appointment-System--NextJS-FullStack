import { PATIENT_REFERRAL_SOURCES } from "@/lib/patient-referral-sources";
import type { PatientClinicalProfile } from "@/types/types";

/** Normalize clinical_profile referral fields — safe for JSON blobs from API/SSR. */
function readReferralFields(clinicalProfile: PatientClinicalProfile | null | undefined): {
  source: string;
  detail: string;
} {
  if (!clinicalProfile || typeof clinicalProfile !== "object") {
    return { source: "", detail: "" };
  }
  const source =
    typeof clinicalProfile.referral_source === "string"
      ? clinicalProfile.referral_source.trim()
      : "";
  const detail =
    typeof clinicalProfile.referral_detail === "string"
      ? clinicalProfile.referral_detail.trim()
      : "";
  return { source, detail };
}

/**
 * Map stored `referral_source` code → dropdown label; append `referral_detail` when set.
 * Shared by patient portal profile, CP patient detail, and appointment cards.
 */
export function formatPatientReferralDisplay(
  clinicalProfile: PatientClinicalProfile | null | undefined
): string | null {
  const { source, detail } = readReferralFields(clinicalProfile);
  const label = source
    ? (PATIENT_REFERRAL_SOURCES.find((x) => x.value === source)?.label ?? source)
    : "";
  if (!label && !detail) return null;
  if (detail) return `${label ? `${label} — ` : ""}${detail}`;
  return label;
}
