"use client";

import { cn } from "@/lib/utils";
import { DoctorMiniAvatar } from "./DoctorMiniAvatar";
import { DoctorSpecialtyBadge } from "./DoctorSpecialtyBadge";
import type { DoctorIdentityDoctor } from "./DoctorIdentityRow";

/** Taller Radix item — avatar + name + specialty badge; pair with `doctorSelectItemClass`. */
export const doctorSelectItemClass = cn(
  "items-start py-2.5",
  "[&_[data-slot=select-item-text]]:block [&_[data-slot=select-item-text]]:w-full [&_[data-slot=select-item-text]]:text-left",
  "*:[span]:last:items-start *:[span]:last:flex-col *:[span]:last:gap-1 *:[span]:last:text-left"
);

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
