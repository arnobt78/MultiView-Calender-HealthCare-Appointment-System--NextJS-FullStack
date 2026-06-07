"use client";

import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
import { cn } from "@/lib/utils";

/** Shared appointment status pill — delegates to glass badge for detail/snapshot tables. */
export function ClinicalAppointmentStatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  return (
    <AppointmentStatusGlassBadge
      status={status}
      size="detail"
      className={cn(className)}
    />
  );
}
