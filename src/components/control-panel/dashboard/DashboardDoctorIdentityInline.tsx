"use client";

import { Stethoscope } from "lucide-react";
import { DoctorMiniAvatar } from "@/components/shared/doctor-display/DoctorMiniAvatar";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { doctorDetailHref } from "@/lib/entity-routes";
import type { DashboardOverviewQueueDoctor } from "@/lib/dashboard-overview-queue";
import { cn } from "@/lib/utils";

type Props = {
  doctor: DashboardOverviewQueueDoctor;
  className?: string;
};

/** Inline treating doctor row — avatar, sky link name, specialty badge. */
export function DashboardDoctorIdentityInline({ doctor, className }: Props) {
  const label = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-0.5",
        className
      )}
    >
      <Stethoscope className="h-3.5 w-3.5 shrink-0 text-sky-600/85" aria-hidden />
      <DoctorMiniAvatar
        doctor={{
          id: doctor.id,
          display_name: doctor.display_name,
          email: doctor.email,
          image: doctor.image,
        }}
        className="h-6 w-6 shrink-0"
      />
      <EntityTitleLink
        href={doctorDetailHref("admin", doctor.id)}
        label={label}
        className="text-xs font-medium"
      />
      <DoctorSpecialtyBadge specialty={doctor.specialty} showIcon={false} className="text-[9px]" />
    </span>
  );
}
