"use client";

import type { ReactNode } from "react";
import { AppointmentCardMetaRow } from "@/components/shared/AppointmentCardMetaRow";
import { DoctorAvatar } from "@/components/shared/doctor-display/DoctorAvatar";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { PortalStaffLink } from "@/components/shared/PortalStaffLink";
import type { PortalAppointmentStaffUser } from "@/lib/serializers";
import { cn } from "@/lib/utils";

type Props = {
  icon: ReactNode;
  label: string;
  staff: PortalAppointmentStaffUser;
  className?: string;
};

/**
 * One responsive row: meta icon + label + avatar + sky name link + email + specialty badge.
 */
export function PortalAppointmentStaffIdentityBlock({
  icon,
  label,
  staff,
  className,
}: Props) {
  const displayName = staff.display_name?.trim() || staff.email?.trim() || "—";
  const email = staff.email?.trim() || null;

  return (
    <AppointmentCardMetaRow
      icon={icon}
      label={`${label}:`}
      wrap
      className={cn("flex w-full min-w-0 items-center", className)}
    >
      <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <DoctorAvatar
          doctor={{
            id: staff.id,
            display_name: staff.display_name,
            email: staff.email,
            image: staff.image ?? null,
          }}
          sizeClassName="h-6 w-6"
        />
        <PortalStaffLink
          staffUserId={staff.id}
          staffRole={staff.role}
          label={displayName}
          wrapLabel={false}
        />
        {email ? (
          <span className="min-w-0 truncate text-xs text-gray-500">({email})</span>
        ) : null}
        {staff.specialty?.trim() ? (
          <DoctorSpecialtyBadge specialty={staff.specialty} className="shrink-0" />
        ) : null}
      </span>
    </AppointmentCardMetaRow>
  );
}
