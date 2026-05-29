"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  done: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  alert: "bg-red-100 text-red-700 border-red-200",
};

/** Status pill for dashboard overview queue rows. */
export function DashboardAppointmentStatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  if (!status?.trim()) return null;
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 text-xs capitalize",
        STATUS_COLORS[status] ?? "",
        className
      )}
    >
      {status}
    </Badge>
  );
}
