"use client";

import { cn } from "@/lib/utils";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { controlPanelStaffDetailHref } from "@/lib/entity-routes";
import { DoctorSpecialtyBadge } from "./DoctorSpecialtyBadge";

type DoctorLinkStackProps = {
  doctorId: string;
  name: string;
  email?: string | null;
  specialty?: string | null;
  linkKind?: "role" | "admin-cp";
  /** Snapshot/API role — routes admin accounts to CP `/users/:id`. */
  staffRole?: string | null;
  className?: string;
  nameClassName?: string;
};

/**
 * Stacked doctor text for table cells (no avatar): name link → email → specialty badge (own lines).
 * Default `gap-1` between rows; pass `className="gap-0"` to match Calendar Owner–style tight stacks.
 */
export function DoctorLinkStack({
  doctorId,
  name,
  email,
  specialty,
  linkKind = "role",
  staffRole = null,
  className,
  nameClassName,
}: DoctorLinkStackProps) {
  const label = name.trim() || email?.trim() || "Doctor";

  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      {linkKind === "admin-cp" ? (
        <EntityTitleLink
          href={controlPanelStaffDetailHref(doctorId, staffRole)}
          label={label}
          className={cn("font-medium text-sm self-start", nameClassName)}
        />
      ) : (
        <RoleEntityLink
          kind="doctor"
          id={doctorId}
          label={label}
          className={cn("font-medium text-sm self-start", nameClassName)}
        />
      )}
      {email?.trim() ? (
        <p className="truncate text-xs text-muted-foreground">{email.trim()}</p>
      ) : null}
      <DoctorSpecialtyBadge specialty={specialty} className="self-start" />
    </div>
  );
}
