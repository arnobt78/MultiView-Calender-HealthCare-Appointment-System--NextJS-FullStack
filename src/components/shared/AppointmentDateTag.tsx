"use client";

import { useEffect } from "react";
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

  // #region agent log
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    fetch("http://127.0.0.1:7938/ingest/15849825-35e9-4832-9975-ca3563c056ec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "6e525f",
      },
      body: JSON.stringify({
        sessionId: "6e525f",
        runId: "badge-tag",
        hypothesisId: "H1-nav-anchor",
        location: "AppointmentDateTag.tsx",
        message: "date tag computed",
        data: {
          kind,
          apptDay: date.toISOString().slice(0, 10),
          anchorDay: anchor.toISOString().slice(0, 10),
          usedCustomAnchor: Boolean(referenceDate),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [kind, date, anchor, referenceDate]);
  // #endregion

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
