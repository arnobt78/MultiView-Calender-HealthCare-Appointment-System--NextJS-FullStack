"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { resolvePatientPortraitUrl } from "@/lib/patient-portrait";
import type { Patient } from "@/types/types";

type PatientPortraitInput = Pick<Patient, "id" | "email" | "clinical_profile"> & {
  firstname?: string;
  lastname?: string;
};

type PatientPortraitAvatarProps = {
  patient: PatientPortraitInput;
  sizeClassName?: string;
  className?: string;
  loading?: boolean;
};

/**
 * Circular patient portrait — demo avatars, `clinical_profile` image keys, then robohash by `id`.
 * See `resolvePatientPortraitUrl` in `src/lib/patient-portrait.ts`.
 */
export function PatientPortraitAvatar({
  patient,
  sizeClassName = "h-9 w-9",
  className,
  loading = false,
}: PatientPortraitAvatarProps) {
  const src = resolvePatientPortraitUrl(patient);
  const fallbackText =
    `${patient.firstname ?? ""} ${patient.lastname ?? ""}`.trim() || patient.email || "?";

  return (
    <UserAvatar
      src={src}
      alt={fallbackText}
      fallbackText={fallbackText}
      sizeClassName={sizeClassName}
      className={className}
      loading={loading}
    />
  );
}
