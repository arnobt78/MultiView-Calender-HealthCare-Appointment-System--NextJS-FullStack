"use client";

import type { ReactNode } from "react";
import {
  DoctorIdentityRow,
  type DoctorIdentityDoctor,
} from "@/components/shared/doctor-display/DoctorIdentityRow";
import { doctorDetailHref } from "@/lib/entity-routes";
import { isAdminRole } from "@/lib/rbac";
import type { EntityRole } from "@/lib/entity-routes";
import type { CalendarOwnerLinkKind } from "@/lib/entity-detail-snapshot-links";

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
  /** Override default admin-cp / role link (snapshot tables pass policy-resolved kind). */
  linkKind?: CalendarOwnerLinkKind;
  /** Snapshot `calendar_owner_role` — required for `portal-admin` owner links. */
  staffRole?: string | null;
  /** Enriched user row from `useUsers` when snapshot only has denormalized strings. */
  doctorById?: Map<string, DoctorLookup>;
  size?: "sm" | "md";
  showSpecialty?: boolean;
  /** `inline` — avatar + name + email + badges on one responsive row (entity detail People). */
  layout?: "stack" | "inline";
  showRoleBadge?: boolean;
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
  linkKind: linkKindOverride,
  staffRole = null,
  doctorById,
  size = "sm",
  showSpecialty = true,
  layout = "stack",
  showRoleBadge = false,
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
        linkKind={linkKindOverride ?? (isAdminRole(viewerRole) ? "admin-cp" : "role")}
        staffRole={staffRole}
        viewerRole={viewerRole}
        size={size}
        layout={layout}
        showEmail
        showSpecialty={showSpecialty}
        showRoleBadge={showRoleBadge}
      />
      {footer}
    </div>
  );
}
