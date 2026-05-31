"use client";

import { Stethoscope } from "lucide-react";
import { useDoctorDisplayOptional } from "@/context/DoctorDisplayContext";
import {
  clinicalBadgeInlineClass,
  clinicalBadgeInlineIconClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

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
        clinicalBadgeInlineClass,
        "px-2 font-normal shrink-0 text-[10px]",
        className
      )}
    >
      {showIcon && <Stethoscope className={clinicalBadgeInlineIconClass} aria-hidden />}
      {specialty.trim()}
    </span>
  );
}
