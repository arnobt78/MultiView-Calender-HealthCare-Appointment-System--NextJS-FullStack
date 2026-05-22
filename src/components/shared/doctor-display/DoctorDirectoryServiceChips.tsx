"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatAppointmentTypeChipMeta } from "@/lib/appointment-type-scheduling-meta";
import type { DoctorDirectoryAppointmentType } from "@/lib/doctor-directory";
import { cn } from "@/lib/utils";

type DoctorDirectoryServiceChipsProps = {
  types: DoctorDirectoryAppointmentType[];
  className?: string;
  /** Booking doctor picker: name + duration only; meta stays on `/services` + type tiles. */
  showSchedulingMeta?: boolean;
};

/** Inline wrapping labels — global (violet) vs custom (sky); optional buf/step subline. */
export function DoctorDirectoryServiceChips({
  types,
  className,
  showSchedulingMeta = true,
}: DoctorDirectoryServiceChipsProps) {
  if (!types.length) {
    return <p className="text-xs text-muted-foreground">Flexible booking — no fixed visit types</p>;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {types.map((t) => {
        const meta = formatAppointmentTypeChipMeta({
          duration_minutes: t.duration_minutes,
          buffer_before_minutes: t.buffer_before_minutes,
          buffer_after_minutes: t.buffer_after_minutes,
          slot_interval_minutes: t.slot_interval_minutes,
          is_global: t.is_global,
        });
        return (
          <Badge
            key={t.id}
            variant="outline"
            title={showSchedulingMeta ? meta : `${t.name} · ${t.duration_minutes} min`}
            className={cn(
              "max-w-full gap-1 text-[10px]",
              showSchedulingMeta && "h-auto flex-col items-start gap-0 py-1 text-left",
              t.is_global ? "calendar-glass-badge-violet" : "calendar-glass-badge-sky"
            )}
          >
            <span className="inline-flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate">{t.name}</span>
              <span className="text-muted-foreground shrink-0">· {t.duration_minutes} min</span>
            </span>
            {showSchedulingMeta ? (
              <span className="pl-4 text-[9px] font-normal text-muted-foreground leading-tight">
                {meta}
              </span>
            ) : null}
          </Badge>
        );
      })}
    </div>
  );
}
