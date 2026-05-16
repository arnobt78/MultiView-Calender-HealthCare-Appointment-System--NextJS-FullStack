"use client";

import { DoctorMiniAvatar } from "./DoctorMiniAvatar";
import { DoctorSpecialtyBadge } from "./DoctorSpecialtyBadge";
import type { DoctorIdentityDoctor } from "./DoctorIdentityRow";

/** Row content for doctor `<SelectItem>` — avatar, name, glass specialty. */
export function DoctorSelectOption({ doctor }: { doctor: DoctorIdentityDoctor }) {
  const label = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  return (
    <span className="flex items-center gap-2 min-w-0 py-0.5">
      <DoctorMiniAvatar doctor={doctor} className="h-7 w-7" />
      <span className="truncate flex-1 text-sm">{label}</span>
      <DoctorSpecialtyBadge specialty={doctor.specialty} showIcon={false} className="shrink-0" />
    </span>
  );
}
