"use client";

import type { ReactNode } from "react";
import {
  DoctorIdentityRow,
  type DoctorIdentityDoctor,
} from "@/components/shared/doctor-display/DoctorIdentityRow";
import { doctorDetailHref } from "@/lib/entity-routes";
import { isAdminRole } from "@/lib/rbac";
import type { EntityRole } from "@/lib/entity-routes";

type DoctorLookup = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  image?: string | null;
  specialty?: string | null;
};

export type DoctorIdentityCellProps = {
  doctorId: string;
  name: string;
  email?: string | null;
  /** Snapshot/API image — used before `doctorById` hydrates from `useUsers`. */
  image?: string | null;
  specialty?: string | null;
  viewerRole: EntityRole;
  /** Enriched user row from `useUsers` when snapshot only has denormalized strings. */
  doctorById?: Map<string, DoctorLookup>;
  size?: "sm" | "md";
  showSpecialty?: boolean;
  className?: string;
  /** Optional footnote under stack (e.g. primary care line on treating physician). */
  footer?: ReactNode;
};

/**
 * Snapshot / table doctor column — resolves image + specialty from `doctorById` when present.
 */
export function DoctorIdentityCell({
  doctorId,
  name,
  email,
  image,
  specialty,
  viewerRole,
  doctorById,
  size = "sm",
  showSpecialty = true,
  className,
  footer,
}: DoctorIdentityCellProps) {
  const fromMap = doctorById?.get(doctorId);
  const snapshotImage = image?.trim() ? image.trim() : null;
  const doctor: DoctorIdentityDoctor = {
    id: doctorId,
    email: email ?? fromMap?.email ?? null,
    display_name: name.trim() || (fromMap?.display_name ?? null),
    /** Snapshot/API portrait wins — avoids robohash flash when staff directory hydrates later. */
    image: snapshotImage ?? fromMap?.image?.trim() ?? null,
    specialty: specialty ?? fromMap?.specialty ?? null,
  };

  return (
    <div className={className}>
      <DoctorIdentityRow
        doctor={doctor}
        linkKind={isAdminRole(viewerRole) ? "admin-cp" : "role"}
        size={size}
        showEmail
        showSpecialty={showSpecialty}
      />
      {footer}
    </div>
  );
}
