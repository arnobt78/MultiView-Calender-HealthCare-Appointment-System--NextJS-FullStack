"use client";

import { Badge } from "@/components/ui/badge";
import { getPatientCareLevelShortLabel } from "@/lib/patient-care-level";
import { cn } from "@/lib/utils";

type PatientCareTierGlassBadgeProps = {
  careLevel: number | null | undefined;
  /** Tighter pill for compact rows. */
  compact?: boolean;
  className?: string;
};

/**
 * Violet glass care-tier pill — mirrors age badge style while keeping tier semantics concise.
 */
export function PatientCareTierGlassBadge({
  careLevel,
  compact = false,
  className,
}: PatientCareTierGlassBadgeProps) {
  const label = getPatientCareLevelShortLabel(careLevel);
  return (
    <Badge
      variant="outline"
      className={cn(
        "calendar-glass-badge calendar-glass-badge-violet shrink-0 font-medium",
        compact ? "h-4 min-h-4 px-1.5 py-0 text-[9px] leading-none" : "px-2 py-0 text-[10px]",
        className
      )}
      title={label}
    >
      {label}
    </Badge>
  );
}

