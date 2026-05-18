"use client";

import { cn } from "@/lib/utils";
import { DoctorAvatar } from "./DoctorAvatar";
import { DoctorSpecialtyBadge } from "./DoctorSpecialtyBadge";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { doctorDetailHref } from "@/lib/entity-routes";
import {
  clinicalCellMutedTextClass,
  clinicalStackGapClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import type { DoctorAvatarInput } from "@/lib/doctor-avatar";

export type DoctorIdentityDoctor = DoctorAvatarInput & {
  display_name?: string | null;
  email?: string | null;
  specialty?: string | null;
};

type DoctorIdentityRowProps = {
  doctor: DoctorIdentityDoctor;
  /** When set, name links to role-aware doctor detail (admin CP vs /doctors/:id). */
  linkKind?: "role" | "admin-cp" | "none";
  size?: "sm" | "md";
  className?: string;
  showSpecialty?: boolean;
  /** Show email line (default true for sm table cells, true for md). */
  showEmail?: boolean;
  /** Override vertical stack gap — defaults to `clinicalStackGapClass`. */
  stackGapClassName?: string;
};

/**
 * Reusable doctor row: avatar + name link → email (middle) → specialty badge (bottom).
 * Table layout matches patient-management Primary Doctor column; no `DoctorLinkStack` gap-1.
 */
export function DoctorIdentityRow({
  doctor,
  linkKind = "role",
  size = "md",
  className,
  showSpecialty = true,
  showEmail = true,
  stackGapClassName = clinicalStackGapClass,
}: DoctorIdentityRowProps) {
  const label = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  const avatarSize = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const emailVisible = showEmail;
  const nameTextClass = size === "sm" ? "text-sm" : "text-sm";

  const nameLink =
    linkKind === "none" ? (
      <span className={cn("truncate font-normal text-foreground", nameTextClass)}>{label}</span>
    ) : linkKind === "admin-cp" ? (
      <EntityTitleLink
        href={doctorDetailHref("admin", doctor.id)}
        label={label}
        className={cn("min-w-0 self-start truncate font-normal", nameTextClass)}
      />
    ) : (
      <RoleEntityLink
        kind="doctor"
        id={doctor.id}
        label={label}
        className={cn("min-w-0 self-start truncate font-normal", nameTextClass)}
      />
    );

  return (
    <div className={cn("flex min-w-0 items-center gap-2", clinicalTableCellMinRowClass, className)}>
      <DoctorAvatar doctor={doctor} sizeClassName={avatarSize} />
      <div className={cn("flex min-w-0 flex-1 flex-col justify-center", stackGapClassName)}>
        {nameLink}
        {emailVisible && doctor.email?.trim() ? (
          <span className={cn("truncate", clinicalCellMutedTextClass)} title={doctor.email.trim()}>
            {doctor.email.trim()}
          </span>
        ) : null}
        {showSpecialty ? <DoctorSpecialtyBadge specialty={doctor.specialty} className="self-start" /> : null}
      </div>
    </div>
  );
}
