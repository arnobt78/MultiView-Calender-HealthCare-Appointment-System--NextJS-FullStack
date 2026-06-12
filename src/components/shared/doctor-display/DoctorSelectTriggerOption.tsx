"use client";

import { DoctorMiniAvatar } from "./DoctorMiniAvatar";
import { DoctorSpecialtyBadge } from "./DoctorSpecialtyBadge";
import type { DoctorIdentityDoctor } from "./DoctorIdentityRow";

/**
 * Single-line doctor row for fixed h-10 Select triggers (invoice hub, insights, CP lists).
 * Avatar + truncated name + specialty badge inline — trigger height never grows; width expands.
 */
export function DoctorSelectTriggerOption({ doctor }: { doctor: DoctorIdentityDoctor }) {
  const label = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";

  return (
    <span className="flex min-w-0 max-w-full items-center gap-1.5">
      <DoctorMiniAvatar doctor={doctor} className="h-6 w-6 shrink-0" />
      <span className="min-w-0 shrink truncate text-xs font-medium text-gray-700">
        {label}
      </span>
      <DoctorSpecialtyBadge
        specialty={doctor.specialty}
        showIcon={false}
        className="hidden max-w-[5.5rem] shrink truncate px-1.5 text-[9px] min-[480px]:inline-flex min-[640px]:max-w-[7.5rem] min-[768px]:max-w-none"
      />
    </span>
  );
}
