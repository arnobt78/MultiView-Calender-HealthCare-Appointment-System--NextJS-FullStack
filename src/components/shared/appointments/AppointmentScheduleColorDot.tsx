"use client";

import { cn } from "@/lib/utils";

type AppointmentScheduleColorDotProps = {
  /** Dashboard palette hex from `resolveAppointmentLineColor` / `colorFromSeed`. */
  color: string;
  className?: string;
};

/** Left accent dot — same deterministic colors as calendar `AppointmentCard` list rail. */
export function AppointmentScheduleColorDot({
  color,
  className,
}: AppointmentScheduleColorDotProps) {
  return (
    <span
      className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}
