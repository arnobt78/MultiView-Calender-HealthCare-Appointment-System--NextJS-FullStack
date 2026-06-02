"use client";

/**
 * Dashboard / list status chips — Open (pending), Alert, Done (`summarizeDayAppointments` rules).
 */

import { Badge } from "@/components/ui/badge";
import type { DailyAppointmentStats } from "@/lib/appointment-stats";
import { cn } from "@/lib/utils";

type Props = {
  stats: Pick<DailyAppointmentStats, "open" | "alert" | "done">;
  className?: string;
  /** When false, hide chips with zero (doctor portal Today tile). */
  showZero?: boolean;
};

export function AppointmentOpenAlertDoneBadges({
  stats,
  className,
  showZero = true,
}: Props) {
  const chips: { label: string; value: number; tone: string }[] = [
    { label: "Open", value: stats.open, tone: "calendar-glass-badge-amber" },
    { label: "Alert", value: stats.alert, tone: "calendar-glass-badge-rose" },
    { label: "Done", value: stats.done, tone: "calendar-glass-badge-emerald" },
  ];

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      {chips.map(({ label, value, tone }) =>
        showZero || value > 0 ? (
          <Badge
            key={label}
            variant="outline"
            className={cn(
              "calendar-glass-badge min-h-6 min-w-[72px] justify-center text-[10px] font-normal",
              tone
            )}
          >
            {label}: {value}
          </Badge>
        ) : null
      )}
    </span>
  );
}
