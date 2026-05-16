"use client";

import { cn } from "@/lib/utils";
import { DoctorAvatar } from "./DoctorAvatar";
import { DoctorLinkStack } from "./DoctorLinkStack";
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
  /** Show email line (default: true for md, false for sm). */
  showEmail?: boolean;
};

/**
 * Reusable doctor row: avatar + stacked name / email / glass specialty badge (badge always on its own line).
 */
export function DoctorIdentityRow({
  doctor,
  linkKind = "role",
  size = "md",
  className,
  showSpecialty = true,
  showEmail,
}: DoctorIdentityRowProps) {
  const label = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  const avatarSize = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const emailVisible = showEmail ?? size === "md";

  return (
    <div className={cn("flex items-start gap-2 min-w-0", className)}>
      <DoctorAvatar doctor={doctor} sizeClassName={avatarSize} className="" />
      {linkKind === "none" ? (
        <div className="min-w-0 flex flex-col gap-1">
          <span
            className={cn(
              "font-medium truncate text-foreground",
              size === "sm" ? "text-xs" : "text-sm"
            )}
          >
            {label}
          </span>
          {emailVisible && doctor.email ? (
            <span className="text-[10px] text-muted-foreground truncate">{doctor.email}</span>
          ) : null}
          {showSpecialty ? <DoctorSpecialtyBadge specialty={doctor.specialty} className="self-start" /> : null}
        </div>
      ) : (
        <DoctorLinkStack
          doctorId={doctor.id}
          name={label}
          email={emailVisible ? doctor.email : null}
          specialty={showSpecialty ? doctor.specialty : null}
          linkKind={linkKind}
          nameClassName={size === "sm" ? "text-xs" : "text-sm"}
        />
      )}
    </div>
  );
}
