"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PatientAgeGlassBadgeProps = {
  age: number;
  /** Tighter pill for `h-11` Select triggers. */
  compact?: boolean;
  className?: string;
};

/**
 * Sky glass age pill — same tokens as patient portal (`calendar-glass-badge-sky`), value only (no icon / "Age" label).
 */
export function PatientAgeGlassBadge({ age, compact = false, className }: PatientAgeGlassBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "calendar-glass-badge calendar-glass-badge-sky shrink-0 font-medium tabular-nums",
        compact ? "h-4 min-h-4 px-1.5 py-0 text-[9px] leading-none" : "px-2 py-0 text-[10px]",
        className
      )}
    >
      {age} yr
    </Badge>
  );
}
