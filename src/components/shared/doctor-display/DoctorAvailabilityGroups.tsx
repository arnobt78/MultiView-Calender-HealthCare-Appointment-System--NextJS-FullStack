"use client";

import { Badge } from "@/components/ui/badge";
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

/**
 * Renders availability from control-panel DoctorAvailabilityEditor data.
 * Groups weekdays that share the same start/end; separate rows when hours differ.
 */
export function DoctorAvailabilityGroups({
  availabilities,
  /** `inline` — one wrapping row (booking picker); default stacks each hour group. */
  layout = "stacked",
  className,
}: {
  availabilities: DoctorAvailabilitySlot[];
  layout?: "stacked" | "inline";
  className?: string;
}) {
  if (!availabilities.length) {
    return <p className="text-xs text-muted-foreground">No availability set</p>;
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
              <Badge
                key={d}
                variant="outline"
                className="text-[10px] px-1.5 py-0 bg-sky-50 text-sky-700 border-sky-200"
              >
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
    <div className="flex flex-col gap-1.5">
      {rows.map((row) => (
        <div key={`${row.start_min}-${row.end_min}`} className="flex flex-wrap items-center gap-1.5">
          {row.days.map((d) => (
            <Badge
              key={d}
              variant="outline"
              className="text-[10px] px-1.5 py-0 bg-sky-50 text-sky-700 border-sky-200"
            >
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
