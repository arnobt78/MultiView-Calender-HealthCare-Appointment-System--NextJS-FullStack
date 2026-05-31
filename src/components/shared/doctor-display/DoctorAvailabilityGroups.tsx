"use client";

import { Badge } from "@/components/ui/badge";
import {
  buildServicesAvailabilityDisplayRows,
  formatWeekdayTimeRangesInline,
  groupAvailabilityByWeekday,
} from "@/lib/doctor-schedule-display";
import type { AvailabilityWindow } from "@/lib/doctor-schedule-types";
import { cn } from "@/lib/utils";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type DoctorAvailabilitySlot = {
  weekday: number;
  start_min: number;
  end_min: number;
  timezone?: string;
};

function minToTime(min: number): string {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

const dayBadgeClass =
  "shrink-0 text-[10px] px-1.5 py-0 bg-sky-50 text-sky-700 border-sky-200";

const timeChipClass =
  "inline-flex shrink-0 rounded-md border border-slate-200/80 bg-slate-50/80 px-1.5 py-0 text-[10px] tabular-nums text-muted-foreground";

/**
 * Renders availability from control-panel DoctorAvailabilityEditor data.
 * - `services-card` — merge days with identical hours; split hours on one day stay inline on one row.
 * - `stacked` / `inline` — group days that share identical start/end (booking pickers).
 * - `by-weekday` — one row per weekday (doctor-portal collapsed hint style).
 */
export function DoctorAvailabilityGroups({
  availabilities,
  layout = "stacked",
  className,
}: {
  availabilities: DoctorAvailabilitySlot[];
  layout?: "stacked" | "inline" | "by-weekday" | "services-card";
  className?: string;
}) {
  if (!availabilities.length) {
    return <p className="text-xs text-muted-foreground">No availability set</p>;
  }

  if (layout === "services-card") {
    const rows = buildServicesAvailabilityDisplayRows(availabilities);
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {rows.map((row) => (
          <div
            key={`${row.weekdays.join("-")}-${row.ranges.map((r) => `${r.start_min}-${r.end_min}`).join("|")}`}
            className="flex flex-wrap items-center gap-x-1.5 gap-y-1"
          >
            {row.weekdays.map((d) => (
              <Badge key={d} variant="outline" className={dayBadgeClass}>
                {WEEKDAY_SHORT[d] ?? `D${d}`}
              </Badge>
            ))}
            {row.ranges.map((range) => (
              <span
                key={`${range.start_min}-${range.end_min}`}
                className={timeChipClass}
              >
                {minToTime(range.start_min)} – {minToTime(range.end_min)}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (layout === "by-weekday") {
    const grouped = groupAvailabilityByWeekday(availabilities as AvailabilityWindow[]);
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {grouped.map((group) => (
          <div
            key={group.weekday}
            className="flex flex-wrap items-center gap-x-1.5 gap-y-1"
          >
            <Badge variant="outline" className={dayBadgeClass}>
              {WEEKDAY_SHORT[group.weekday] ?? `D${group.weekday}`}
            </Badge>
            <span className="min-w-0 text-[10px] leading-snug text-muted-foreground break-words">
              {formatWeekdayTimeRangesInline(group.windows)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const groups = new Map<string, { start_min: number; end_min: number; days: number[] }>();

  for (const slot of availabilities) {
    const key = `${slot.start_min}-${slot.end_min}`;
    const existing = groups.get(key);
    if (existing) {
      if (!existing.days.includes(slot.weekday)) {
        existing.days.push(slot.weekday);
      }
    } else {
      groups.set(key, {
        start_min: slot.start_min,
        end_min: slot.end_min,
        days: [slot.weekday],
      });
    }
  }

  const rows = Array.from(groups.values()).map((g) => ({
    ...g,
    days: [...g.days].sort((a, b) => a - b),
  }));

  if (layout === "inline") {
    return (
      <div className={cn("inline-flex max-w-full flex-wrap items-center gap-1.5", className)}>
        {rows.map((row) => (
          <span
            key={`${row.start_min}-${row.end_min}`}
            className="inline-flex max-w-full flex-wrap items-center gap-1"
          >
            {row.days.map((d) => (
              <Badge key={d} variant="outline" className={dayBadgeClass}>
                {WEEKDAY_SHORT[d] ?? `D${d}`}
              </Badge>
            ))}
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {minToTime(row.start_min)} – {minToTime(row.end_min)}
            </span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {rows.map((row) => (
        <div key={`${row.start_min}-${row.end_min}`} className="flex flex-wrap items-center gap-1.5">
          {row.days.map((d) => (
            <Badge key={d} variant="outline" className={dayBadgeClass}>
              {WEEKDAY_SHORT[d] ?? `D${d}`}
            </Badge>
          ))}
          <span className="text-[10px] text-muted-foreground">
            {minToTime(row.start_min)} – {minToTime(row.end_min)}
          </span>
        </div>
      ))}
    </div>
  );
}
