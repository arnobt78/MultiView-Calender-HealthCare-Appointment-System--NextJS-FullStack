"use client";

import { DoctorMiniAvatar } from "./DoctorMiniAvatar";
import { DoctorSpecialtyBadge } from "./DoctorSpecialtyBadge";
import type { DoctorIdentityDoctor } from "./DoctorIdentityRow";

/**
 * Single-line doctor row for glass Select triggers (insights scope, etc.).
 * Keeps trigger height at h-10 — use `DoctorSelectOption` for stacked dropdown items.
 */
export function DoctorSelectTriggerOption({ doctor }: { doctor: DoctorIdentityDoctor }) {
  const label = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  return (
    <span className="flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden">
      <DoctorMiniAvatar doctor={doctor} className="h-6 w-6 shrink-0" />
      <span className="min-w-0 truncate text-xs font-medium text-gray-700">{label}</span>
      <DoctorSpecialtyBadge
        specialty={doctor.specialty}
        showIcon={false}
        className="hidden max-w-[7rem] shrink truncate px-1.5 text-[9px] sm:inline-flex"
      />
    </span>
  );
}
