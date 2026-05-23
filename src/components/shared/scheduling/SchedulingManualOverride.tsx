"use client";

import { CalendarClock, ChevronDown, Siren } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, toTitleCaseLabel } from "@/lib/utils";

const glassDatetimeInputClass = cn(
  "h-11 min-h-[2.75rem] w-full min-w-0 rounded-2xl border border-sky-200/50 bg-white/75 px-3 py-0 text-sm text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.14)]",
  "relative cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2"
);

type SchedulingManualOverrideProps = {
  start: string;
  setStart: (v: string) => void;
  end: string;
  setEnd: (v: string) => void;
};

/** Native `<details>` — chevron rotates via `[open]` (no extra state / hydration). */
const manualOverrideDetailsClass = cn(
  "rounded-2xl border border-sky-200/55 bg-sky-50/35 p-3 shadow-[0_10px_32px_rgba(2,132,199,0.08)] backdrop-blur-md",
  "[&[open]_summary_.sched-override-chevron]:rotate-180"
);

/**
 * Collapsed manual Start/End — optional emergency override; server overlap validation still applies.
 */
export function SchedulingManualOverride({
  start,
  setStart,
  end,
  setEnd,
}: SchedulingManualOverrideProps) {
  return (
    <details className={manualOverrideDetailsClass}>
      <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-3 rounded-xl text-sm font-medium text-gray-700 transition-colors hover:bg-sky-50/60 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-1 items-start gap-2 text-left">
          <Siren className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
          <span className="min-w-0 leading-snug">
            {toTitleCaseLabel(
              "Advanced Appointment Scheduling: custom date & time override for emergency cases as manual override (Optional)"
            )}
          </span>
        </span>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200/60 bg-white/90 text-sky-700 shadow-[0_4px_12px_rgba(2,132,199,0.12)]"
          aria-hidden
        >
          <ChevronDown className="sched-override-chevron h-4 w-4 transition-transform duration-200" />
        </span>
      </summary>
      <div className="mt-2 space-y-3 border-t border-sky-200/45 pt-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Optional — for emergency when no availability slot fits. Must not overlap existing
          appointments for this calendar owner.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sched-manual-start" className="flex items-center gap-1.5 text-gray-700">
              <CalendarClock className="h-3.5 w-3.5 text-sky-600" />
              {toTitleCaseLabel("Start")} *
            </Label>
            <Input
              type="datetime-local"
              id="sched-manual-start"
              value={start}
              onChange={(e) => {
                const nextStart = e.target.value;
                setStart(nextStart);
                if (end && nextStart && end < nextStart) setEnd(nextStart);
              }}
              className={glassDatetimeInputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sched-manual-end" className="flex items-center gap-1.5 text-gray-700">
              <CalendarClock className="h-3.5 w-3.5 text-sky-600" />
              {toTitleCaseLabel("End")} *
            </Label>
            <Input
              type="datetime-local"
              id="sched-manual-end"
              value={end}
              onChange={(e) => {
                const newEnd = e.target.value;
                if (start && newEnd < start) setEnd(start);
                else setEnd(newEnd);
              }}
              disabled={!start}
              min={start || undefined}
              className={glassDatetimeInputClass}
            />
          </div>
        </div>
      </div>
    </details>
  );
}
