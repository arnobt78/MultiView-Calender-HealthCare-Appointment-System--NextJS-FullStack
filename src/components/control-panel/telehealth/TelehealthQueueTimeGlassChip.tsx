"use client";

import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { appointmentVisitMetaHeroGlassChipClass } from "@/lib/appointment-visit-meta-badge-ui";
import { cn } from "@/lib/utils";

type Props = {
  start: string | Date;
  className?: string;
};

/** Violet glass time pill — shared by Up Next hero + schedule list meta row. */
export function TelehealthQueueTimeGlassChip({ start, className }: Props) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "calendar-glass-badge calendar-glass-badge-violet inline-flex items-center font-normal",
        appointmentVisitMetaHeroGlassChipClass,
        className
      )}
    >
      <Clock className="shrink-0" aria-hidden />
      {format(new Date(start), "h:mm a")}
    </Badge>
  );
}
