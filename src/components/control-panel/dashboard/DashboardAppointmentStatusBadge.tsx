"use client";

import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
import { cn } from "@/lib/utils";

/** Status pill for dashboard overview queue rows — glass badge parity. */
export function DashboardAppointmentStatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  if (!status?.trim()) return null;
  return (
    <AppointmentStatusGlassBadge
      status={status}
      size="compact"
      className={cn(className)}
    />
  );
}
