"use client";

import { cn } from "@/lib/utils";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { doctorDetailHref } from "@/lib/entity-routes";
import { DoctorAvatar } from "./DoctorAvatar";
import { DoctorSpecialtyBadge } from "./DoctorSpecialtyBadge";
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
};

/**
 * Reusable doctor chip: avatar + name (+ optional link) + glass specialty badge.
 * Used on /services cards, patient tables, and select dropdown rows.
 */
export function DoctorIdentityRow({
  doctor,
  linkKind = "role",
  size = "md",
  className,
  showSpecialty = true,
}: DoctorIdentityRowProps) {
  const label = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  const avatarSize = size === "sm" ? "h-7 w-7" : "h-9 w-9";

  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      <DoctorAvatar doctor={doctor} sizeClassName={avatarSize} />
      <div className="min-w-0 flex flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {linkKind === "none" ? (
            <span
              className={cn(
                "font-medium truncate text-foreground",
                size === "sm" ? "text-xs" : "text-sm"
              )}
            >
              {label}
            </span>
          ) : linkKind === "admin-cp" ? (
            <EntityTitleLink
              href={doctorDetailHref("admin", doctor.id)}
              label={label}
              className={size === "sm" ? "text-xs font-medium" : "text-sm font-medium"}
            />
          ) : (
            <RoleEntityLink
              kind="doctor"
              id={doctor.id}
              label={label}
              className={size === "sm" ? "text-xs font-medium" : "text-sm font-medium"}
            />
          )}
          {showSpecialty && <DoctorSpecialtyBadge specialty={doctor.specialty} showIcon={size !== "sm"} />}
        </div>
        {doctor.email && size === "md" && (
          <span className="text-[10px] text-muted-foreground truncate">{doctor.email}</span>
        )}
      </div>
    </div>
  );
}
