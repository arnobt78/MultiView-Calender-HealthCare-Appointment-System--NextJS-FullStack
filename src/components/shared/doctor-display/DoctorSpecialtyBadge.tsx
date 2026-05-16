"use client";

import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDoctorDisplayOptional } from "@/context/DoctorDisplayContext";

type DoctorSpecialtyBadgeProps = {
  specialty: string | null | undefined;
  className?: string;
  /** Hide icon on very compact rows (tables). */
  showIcon?: boolean;
};

/** Glassmorphic specialty pill — color keyed by specialty; normal weight (not medium/bold) app-wide. */
export function DoctorSpecialtyBadge({
  specialty,
  className,
  showIcon = true,
}: DoctorSpecialtyBadgeProps) {
  const { getSpecialtyGlassClassName } = useDoctorDisplayOptional();
  if (!specialty?.trim()) return null;

  return (
    <span
      className={cn(
        getSpecialtyGlassClassName(specialty),
        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-normal shrink-0",
        className
      )}
    >
      {showIcon && <Stethoscope className="h-3 w-3 shrink-0" aria-hidden />}
      {specialty.trim()}
    </span>
  );
}
