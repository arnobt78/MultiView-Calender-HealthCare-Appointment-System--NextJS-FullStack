"use client";

import { cn } from "@/lib/utils";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { doctorDetailHref } from "@/lib/entity-routes";
import { DoctorSpecialtyBadge } from "./DoctorSpecialtyBadge";

type DoctorLinkStackProps = {
  doctorId: string;
  name: string;
  email?: string | null;
  specialty?: string | null;
  linkKind?: "role" | "admin-cp";
  className?: string;
  nameClassName?: string;
};

/**
 * Stacked doctor text for table cells (no avatar): name link → email → specialty badge (own lines).
 */
export function DoctorLinkStack({
  doctorId,
  name,
  email,
  specialty,
  linkKind = "role",
  className,
  nameClassName,
}: DoctorLinkStackProps) {
  const label = name.trim() || email?.trim() || "Doctor";

  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      {linkKind === "admin-cp" ? (
        <EntityTitleLink
          href={doctorDetailHref("admin", doctorId)}
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
