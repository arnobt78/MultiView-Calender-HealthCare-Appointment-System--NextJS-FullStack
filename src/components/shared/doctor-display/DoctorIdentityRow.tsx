"use client";

import { cn } from "@/lib/utils";
import { DoctorAvatar } from "./DoctorAvatar";
import { DoctorSpecialtyBadge } from "./DoctorSpecialtyBadge";
import { EntityActiveStatusBadge } from "@/components/shared/entity-display/EntityActiveStatusBadge";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { doctorDetailHref, portalAdminDetailHref } from "@/lib/entity-routes";
import type { EntityRole } from "@/lib/entity-routes";
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
  /** When set, name links to role-aware doctor detail (admin CP vs /doctors/:id vs portal /admins/:id). */
  linkKind?: "role" | "admin-cp" | "portal-admin" | "none";
  /** Required when `linkKind` is `portal-admin` — must be `admin`. */
  staffRole?: string | null;
  viewerRole?: EntityRole;
  size?: "sm" | "md";
  className?: string;
  showSpecialty?: boolean;
  /** Show email line (default true for sm table cells, true for md). */
  showEmail?: boolean;
  /** Override vertical stack gap — defaults to `clinicalStackGapClass`. */
  stackGapClassName?: string;
  /**
   * `stack` — table cells (name / email / badge lines).
   * `inline` — patient detail schema: avatar + name (email) + badge on one wrapped row.
   */
  layout?: "stack" | "inline";
  /** When set, Active/Inactive pill sits inline with specialty (doctor management table). */
  activeStatus?: boolean;
  /** Staff role pill (admin/doctor) — appointment detail People rows. */
  showRoleBadge?: boolean;
};

/**
 * Reusable doctor row: avatar + name link → email (middle) → specialty badge (bottom).
 * Table layout matches patient-management Primary Doctor column; no `DoctorLinkStack` gap-1.
 */
export function DoctorIdentityRow({
  doctor,
  linkKind = "role",
  staffRole = null,
  viewerRole = null,
  size = "md",
  className,
  showSpecialty = true,
  showEmail = true,
  stackGapClassName = clinicalStackGapClass,
  layout = "stack",
  activeStatus,
  showRoleBadge = false,
}: DoctorIdentityRowProps) {
  const label = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  const avatarSize = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const emailVisible = showEmail;
  const emailTrimmed = doctor.email?.trim() ?? "";
  const nameTextClass = size === "sm" ? "text-sm" : "text-sm";

  const badgeRow =
    showRoleBadge || showSpecialty || activeStatus !== undefined ? (
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        {showRoleBadge && staffRole ? (
          <UserRoleBadge role={staffRole} className="shrink-0" />
        ) : null}
        {showSpecialty ? (
          <DoctorSpecialtyBadge specialty={doctor.specialty} className="shrink-0" />
        ) : null}
        {activeStatus !== undefined ? (
          <EntityActiveStatusBadge active={activeStatus} />
        ) : null}
      </div>
    ) : null;

  const nameLink =
    linkKind === "none" ? (
      <span className={cn("font-normal text-foreground", layout === "inline" ? "shrink-0" : "truncate", nameTextClass)}>
        {label}
      </span>
    ) : linkKind === "admin-cp" ? (
      <EntityTitleLink
        href={doctorDetailHref("admin", doctor.id)}
        label={label}
        className={cn(
          "min-w-0 font-normal",
          layout === "inline" ? "shrink-0" : "self-start truncate",
          nameTextClass
        )}
      />
    ) : linkKind === "portal-admin" ? (
      (() => {
        const href = portalAdminDetailHref(viewerRole, doctor.id, staffRole);
        return href ? (
          <EntityTitleLink
            href={href}
            label={label}
            className={cn(
              "min-w-0 font-normal",
              layout === "inline" ? "shrink-0" : "self-start truncate",
              nameTextClass
            )}
          />
        ) : (
          <span
            className={cn(
              "font-normal text-foreground",
              layout === "inline" ? "shrink-0" : "truncate",
              nameTextClass
            )}
          >
            {label}
          </span>
        );
      })()
    ) : (
      <RoleEntityLink
        kind="doctor"
        id={doctor.id}
        label={label}
        className={cn(
          "min-w-0 font-normal",
          layout === "inline" ? "shrink-0" : "self-start truncate",
          nameTextClass
        )}
      />
    );

  if (layout === "inline") {
    return (
      <div className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}>
        <DoctorAvatar doctor={doctor} sizeClassName={avatarSize} />
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
          {nameLink}
          {emailVisible && emailTrimmed ? (
            <span className={cn("shrink-0", clinicalCellMutedTextClass)} title={emailTrimmed}>
              ({emailTrimmed})
            </span>
          ) : null}
          {badgeRow}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2", clinicalTableCellMinRowClass, className)}>
      <DoctorAvatar doctor={doctor} sizeClassName={avatarSize} />
      <div className={cn("flex min-w-0 flex-1 flex-col justify-center", stackGapClassName)}>
        {nameLink}
        {emailVisible && emailTrimmed ? (
          <span className={cn("truncate", clinicalCellMutedTextClass)} title={emailTrimmed}>
            {emailTrimmed}
          </span>
        ) : null}
        {badgeRow}
      </div>
    </div>
  );
}
