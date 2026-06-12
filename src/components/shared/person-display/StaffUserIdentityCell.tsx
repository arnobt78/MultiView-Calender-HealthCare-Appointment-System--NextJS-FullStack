"use client";

import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import {
  clinicalIdentityCompactStackBadgeRowClass,
  clinicalIdentityCompactStackNameEmailRowClass,
  clinicalIdentityCompactStackRowClass,
  clinicalIdentityCompactStackTextColClass,
} from "@/lib/clinical-identity-inline-ui";
import {
  clinicalCellMutedTextClass,
  clinicalStackGapClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

type StaffUserIdentityCellProps = {
  displayName: string;
  email?: string | null;
  image?: string | null;
  href: string;
  /** Platform role for optional badge row — omit in tables with a dedicated Role column. */
  role?: string | null;
  showRoleBadge?: boolean;
  avatarSizeClassName?: string;
  className?: string;
  /** `stack` = name/email/badge rows; `compactStack` = row1 name+email, row2 badge (CP invoice table). */
  layout?: "stack" | "compactStack";
};

/**
 * Stacked staff/admin identity for CP tables — h-7 avatar, name, email (doctor row parity).
 */
export function StaffUserIdentityCell({
  displayName,
  email,
  image,
  href,
  role,
  showRoleBadge = false,
  avatarSizeClassName = "h-7 w-7",
  className,
  layout = "stack",
}: StaffUserIdentityCellProps) {
  const label = displayName.trim() || email?.trim() || "—";
  const emailTrim = email?.trim() ?? "";

  const nameNode = (
    <EntityTitleLink
      href={href}
      label={label}
      className="min-w-0 shrink truncate text-sm font-normal"
    />
  );

  const badgeRow =
    showRoleBadge && role ? (
      <UserRoleBadge role={role} className="shrink-0 self-start" />
    ) : null;

  if (layout === "compactStack") {
    return (
      <div className={cn(clinicalIdentityCompactStackRowClass, className)}>
        <UserAvatar
          alt={label}
          src={image}
          fallbackText={label}
          sizeClassName={avatarSizeClassName}
        />
        <div className={clinicalIdentityCompactStackTextColClass}>
          <div className={clinicalIdentityCompactStackNameEmailRowClass}>
            {nameNode}
            {emailTrim ? (
              <span className={cn("shrink-0 text-xs", clinicalCellMutedTextClass)} title={emailTrim}>
                ({emailTrim})
              </span>
            ) : null}
          </div>
          {badgeRow ? (
            <div className={clinicalIdentityCompactStackBadgeRowClass}>{badgeRow}</div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2", clinicalTableCellMinRowClass, className)}>
      <UserAvatar
        alt={label}
        src={image}
        fallbackText={label}
        sizeClassName={avatarSizeClassName}
      />
      <div className={cn("flex min-w-0 flex-1 flex-col justify-center", clinicalStackGapClass)}>
        <EntityTitleLink
          href={href}
          label={label}
          className="min-w-0 self-start truncate text-sm font-normal"
        />
        {emailTrim ? (
          <span className={cn("truncate", clinicalCellMutedTextClass)} title={emailTrim}>
            {emailTrim}
          </span>
        ) : null}
        {badgeRow}
      </div>
    </div>
  );
}
