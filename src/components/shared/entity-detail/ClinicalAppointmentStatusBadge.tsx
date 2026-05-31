"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  done: "border-emerald-200 bg-emerald-50 text-emerald-700",
  alert: "border-rose-200 bg-rose-50 text-rose-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
};

/** Shared appointment status pill — patient/category detail snapshot tables. */
export function ClinicalAppointmentStatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  const key = status?.trim().toLowerCase() ?? "pending";
  return (
    <Badge
      variant="outline"
      className={cn(
        "w-fit shrink-0 capitalize text-xs",
        STATUS_CLASS[key] ?? "border-slate-200 bg-slate-50 text-gray-600",
        className
      )}
    >
      {status ?? "pending"}
    </Badge>
  );
}
