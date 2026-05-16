"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDoctorDisplayOptional } from "@/context/DoctorDisplayContext";
import type { DoctorAvatarInput } from "@/lib/doctor-avatar";

type DoctorAvatarProps = {
  doctor: DoctorAvatarInput & { display_name?: string | null };
  sizeClassName?: string;
  className?: string;
};

/** Round doctor portrait — uploaded image or robohash fallback. */
export function DoctorAvatar({ doctor, sizeClassName = "h-8 w-8", className }: DoctorAvatarProps) {
  const { getDoctorAvatarSrc } = useDoctorDisplayOptional();
  const src = getDoctorAvatarSrc(doctor);
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
      <Image
        src={src}
        alt={name}
        fill
        className="object-cover"
        sizes="64px"
        unoptimized={src.includes("robohash.org")}
      />
      <span className="sr-only">{initials}</span>
    </span>
  );
}
