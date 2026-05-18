"use client";

import { SafeImage } from "@/components/ui/safe-image";
import { cn } from "@/lib/utils";
import { useDoctorDisplayOptional } from "@/context/DoctorDisplayContext";
import type { DoctorAvatarInput } from "@/lib/doctor-avatar";

type DoctorAvatarProps = {
  doctor: DoctorAvatarInput & { display_name?: string | null };
  sizeClassName?: string;
  className?: string;
};

/**
 * Round doctor portrait — uploaded image or robohash fallback.
 * Uses `SafeImage` for remote URLs (identity rows, services cards); see `docs/SAFE_IMAGE_REUSABLE_COMPONENT.md`.
 */
export function DoctorAvatar({ doctor, sizeClassName = "h-8 w-8", className }: DoctorAvatarProps) {
  const { getDoctorAvatarSrc } = useDoctorDisplayOptional();
  const src = getDoctorAvatarSrc(doctor);
  const isRobohash = src.includes("robohash.org");
  const name = doctor.display_name ?? doctor.email ?? "Doctor";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full border border-sky-200/80 bg-sky-50",
        sizeClassName,
        className
      )}
    >
      <SafeImage
        src={src}
        alt={name}
        fill
        className="object-cover"
        sizes="64px"
        unoptimized={isRobohash}
        referrerPolicy="no-referrer"
      />
      <span className="sr-only">{initials}</span>
    </span>
  );
}
