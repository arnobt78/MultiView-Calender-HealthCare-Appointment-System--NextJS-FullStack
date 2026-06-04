"use client";

import type { ReactNode } from "react";
import { AppointmentCardMetaRow } from "@/components/shared/AppointmentCardMetaRow";
import { DoctorAvatar } from "@/components/shared/doctor-display/DoctorAvatar";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { PortalClinicianLink } from "@/components/shared/PortalClinicianLink";
import type { PortalAppointmentClinicianUser } from "@/lib/serializers";
import { cn } from "@/lib/utils";

type Props = {
  icon: ReactNode;
  label: string;
  clinician: PortalAppointmentClinicianUser;
  className?: string;
};

/**
 * One responsive row: meta icon + label + avatar + sky name link + email + specialty badge.
 */
export function PortalAppointmentClinicianIdentityBlock({
  icon,
  label,
  clinician,
  className,
}: Props) {
  const displayName = clinician.display_name?.trim() || clinician.email?.trim() || "—";
  const email = clinician.email?.trim() || null;

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
            id: clinician.id,
            display_name: clinician.display_name,
            email: clinician.email,
            image: clinician.image ?? null,
          }}
          sizeClassName="h-6 w-6"
        />
        <PortalClinicianLink
          clinicianUserId={clinician.id}
          clinicianRole={clinician.role}
          label={displayName}
          wrapLabel={false}
        />
        {email ? (
          <span className="min-w-0 truncate text-xs text-gray-500">({email})</span>
        ) : null}
        {clinician.specialty?.trim() ? (
          <DoctorSpecialtyBadge specialty={clinician.specialty} className="shrink-0" />
        ) : null}
      </span>
    </AppointmentCardMetaRow>
  );
}
