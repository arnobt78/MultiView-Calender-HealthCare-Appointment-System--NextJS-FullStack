"use client";

import { DoctorMiniAvatar } from "./DoctorMiniAvatar";
import { DoctorSpecialtyBadge } from "./DoctorSpecialtyBadge";
import type { DoctorIdentityDoctor } from "./DoctorIdentityRow";

/** Row content for doctor `<SelectItem>` — avatar, name, then badge on next line. */
export function DoctorSelectOption({ doctor }: { doctor: DoctorIdentityDoctor }) {
  const label = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  return (
    <span className="flex items-start gap-2 min-w-0 py-0.5">
      <DoctorMiniAvatar doctor={doctor} className="h-7 w-7 shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm">{label}</span>
        <DoctorSpecialtyBadge specialty={doctor.specialty} className="self-start" />
      </span>
    </span>
  );
}
