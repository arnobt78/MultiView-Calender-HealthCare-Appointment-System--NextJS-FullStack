"use client";

import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/safe-image";
import { useDoctorDisplayOptional } from "@/context/DoctorDisplayContext";
import type { DoctorAvatarInput } from "@/lib/doctor-avatar";

type DoctorMiniAvatarProps = {
  doctor: DoctorAvatarInput & { display_name?: string | null; email?: string | null };
  className?: string;
};

/** Compact round avatar for selects and dense tables (SafeImage + robohash fallback). */
export function DoctorMiniAvatar({ doctor, className }: DoctorMiniAvatarProps) {
  const { getDoctorAvatarSrc } = useDoctorDisplayOptional();
  const alt = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  const src = getDoctorAvatarSrc(doctor);

  return (
    <span
      className={cn(
        "relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-sky-200/80",
        className
      )}
    >
      <SafeImage
        src={src}
        alt={alt}
        fill
        sizes="32px"
        className="object-cover object-center"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </span>
  );
}
