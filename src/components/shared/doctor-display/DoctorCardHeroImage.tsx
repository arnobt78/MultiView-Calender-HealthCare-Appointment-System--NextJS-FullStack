"use client";

import { SafeImage } from "@/components/ui/safe-image";
import { getDoctorAvatarSrc } from "@/lib/doctor-avatar";
import type { DoctorAvatarInput } from "@/lib/doctor-avatar";

type DoctorCardHeroImageProps = {
  doctor: DoctorAvatarInput & { display_name?: string | null };
  className?: string;
};

/**
 * /services card hero — full portrait visible inside frame (contain + top bias fallback).
 * Avoids cropping heads from aggressive `object-cover` on short fixed-height banners.
 */
export function DoctorCardHeroImage({ doctor, className }: DoctorCardHeroImageProps) {
  const src = getDoctorAvatarSrc(doctor);
  const alt = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";

  return (
    <div className={`relative h-40 w-full overflow-hidden rounded-t-[20px] bg-sky-50 ${className ?? ""}`}>
      <SafeImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-contain object-center p-1"
        unoptimized={src.includes("robohash.org")}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
