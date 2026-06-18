"use client";

import { Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { appointmentVisitMetaHeroGlassChipClass } from "@/lib/appointment-visit-meta-badge-ui";
import { cn } from "@/lib/utils";

type TelehealthSessionBadgeProps = {
  className?: string;
  /** Up Next hero — calendar glass sky pill (matches status/fee/billing chips). */
  glass?: boolean;
};

/** Matches dashboard list cards + doctor-portal upcoming rows. */
export function TelehealthSessionBadge({ className, glass = false }: TelehealthSessionBadgeProps) {
  if (glass) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "calendar-glass-badge calendar-glass-badge-sky inline-flex w-fit shrink-0 self-start items-center font-normal",
          appointmentVisitMetaHeroGlassChipClass,
          className
        )}
      >
        <Video className="shrink-0" aria-hidden />
        Telehealth
      </Badge>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 self-start items-center gap-1 rounded-full border border-sky-200/60 bg-sky-100/80 px-2 py-0.5 text-[10px] font-normal text-sky-700",
        className
      )}
    >
      <Video className="h-3 w-3" aria-hidden />
      Telehealth
    </span>
  );
}
