"use client";

import { SafeImage } from "@/components/ui/safe-image";
import { getDoctorAvatarSrc } from "@/lib/doctor-avatar";
import type { DoctorAvatarInput } from "@/lib/doctor-avatar";
import { cn } from "@/lib/utils";

type DoctorCardHeroImageProps = {
  doctor: DoctorAvatarInput & { display_name?: string | null; email?: string | null };
  className?: string;
};

/**
 * /services card hero — uniform full-bleed tiles with face-biased crop.
 * Blurred backdrop fills letterbox gaps for mixed portrait/landscape sources.
 */
export function DoctorCardHeroImage({ doctor, className }: DoctorCardHeroImageProps) {
  const src = getDoctorAvatarSrc(doctor);
  const alt = doctor.display_name?.trim() || doctor.email?.trim() || "Doctor";
  const isRobohash = src.includes("robohash.org");

  return (
    <div
      className={cn(
        "relative h-44 w-full overflow-hidden rounded-t-[20px] bg-gradient-to-br from-sky-100 via-sky-50 to-white",
        className
      )}
    >
      {/* Soft fill so mixed aspect ratios never show flat white gutters */}
      <SafeImage
        src={src}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="scale-110 object-cover object-[center_22%] blur-md opacity-70 saturate-125"
        unoptimized={isRobohash}
        referrerPolicy="no-referrer"
      />

      {/* Sharp portrait — cover + upper bias keeps faces in frame */}
      <SafeImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className={cn(
          "object-cover object-[center_22%]",
          isRobohash ? "scale-[0.92]" : "scale-100"
        )}
        unoptimized={isRobohash}
        referrerPolicy="no-referrer"
      />

      {/*
        Bottom seam: solid white at the edge (matches card body), then a short soft ramp
        so there is no hard photo line — upper portrait stays clear.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,#ffffff_0%,rgba(255,255,255,0.9)_18%,rgba(255,255,255,0.5)_42%,rgba(255,255,255,0.12)_68%,transparent_100%)]"
        aria-hidden
      />
    </div>
  );
}
