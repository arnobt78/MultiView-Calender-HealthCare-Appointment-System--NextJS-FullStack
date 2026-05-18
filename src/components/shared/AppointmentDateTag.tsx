"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  appointmentDateTagBadgeClass,
  appointmentDateTagLabel,
  getAppointmentDateTagKind,
  getCalendarTagReferenceDate,
} from "@/lib/appointment-date-tags";

type AppointmentDateTagProps = {
  date: Date;
  /** Omit to use real calendar today (`getCalendarTagReferenceDate`). */
  referenceDate?: Date;
  className?: string;
};

/** Passed / Today / Tomorrow / Later pill — use in title row with `shrink-0`. */
export function AppointmentDateTag({
  date,
  referenceDate,
  className,
}: AppointmentDateTagProps) {
  const anchor = referenceDate ?? getCalendarTagReferenceDate();
  const kind = getAppointmentDateTagKind(date, anchor);

  if (!kind) return null;
  return (
    <Badge
      variant="outline"
      className={cn(
        appointmentDateTagBadgeClass(kind),
        "shrink-0",
        className
      )}
    >
      {appointmentDateTagLabel(kind)}
    </Badge>
  );
}
