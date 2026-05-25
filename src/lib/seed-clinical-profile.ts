import type { Prisma } from "@prisma/client";

/**
 * Idempotent merge for `Patient.clinical_profile` JSON during seed scripts.
 * Preserves existing keys (allergies, notes, etc.) while applying portrait and demo fields.
 */
export function mergeClinicalProfileJson(
  existing: unknown,
  patch: Record<string, unknown>
): Prisma.InputJsonValue {
  const base =
    existing !== null &&
    typeof existing === "object" &&
    !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  return { ...base, ...patch } as Prisma.InputJsonValue;
}

/** Demo patient portrait paths under /public/users — used by seed + resolvePatientPortraitUrl fallback. */
export const DEMO_PATIENT_PORTRAIT_BY_EMAIL: Readonly<Record<string, string>> = {
  "test@patient.com": "/users/img-3.avif",
  "maria.schmidt@demo.healthcal": "/users/img-4.avif",
  "jan.mueller@demo.healthcal": "/users/img-5.avif",
  "anya.petrov@demo.healthcal": "/users/img-6.avif",
  "thomas.weber@demo.healthcal": "/users/img-7.avif",
};
