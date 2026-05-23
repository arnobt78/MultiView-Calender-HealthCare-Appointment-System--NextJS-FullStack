"use client";

import { CalendarClock } from "lucide-react";
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

/**
 * Collapsed manual Start/End — bypasses slot chips; server overlap validation still applies.
 */
export function SchedulingManualOverride({
  start,
  setStart,
  end,
  setEnd,
}: SchedulingManualOverrideProps) {
  return (
    <details className="rounded-2xl border border-sky-200/55 bg-sky-50/20 p-3">
      <summary className="cursor-pointer text-sm font-medium text-gray-700">
        {toTitleCaseLabel("Advanced: custom start and end")}
      </summary>
      <p className="mt-2 text-xs leading-relaxed text-gray-600">
        Overrides suggested slots. Times must not overlap existing appointments for this
        calendar owner.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
    </details>
  );
}
