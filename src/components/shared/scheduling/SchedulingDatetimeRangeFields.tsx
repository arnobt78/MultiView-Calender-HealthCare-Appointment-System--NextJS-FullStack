"use client";

import { CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DoctorSettingsFieldLabel } from "@/components/shared/doctor-settings/DoctorSettingsFieldLabel";
import {
  glassDatetimeLocalInputClass,
  glassDatetimeLocalInputClassAmber,
} from "@/lib/scheduling-glass-input-classes";
import { cn } from "@/lib/utils";

type Tone = "sky" | "amber";

type Props = {
  tone?: Tone;
  start: string;
  setStart: (v: string) => void;
  end: string;
  setEnd: (v: string) => void;
  startId?: string;
  endId?: string;
  className?: string;
};

/**
 * Start/End datetime-local pair — labels use `mb-1` + `text-xs` (doctor portal schedule cards).
 * End disabled until start set; end min follows start.
 */
export function SchedulingDatetimeRangeFields({
  tone = "sky",
  start,
  setStart,
  end,
  setEnd,
  startId = "sched-range-start",
  endId = "sched-range-end",
  className,
}: Props) {
  const inputClass =
    tone === "amber" ? glassDatetimeLocalInputClassAmber : glassDatetimeLocalInputClass;
  const iconClass = tone === "amber" ? "text-amber-600" : "text-sky-600";

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
      <div className="space-y-1">
        <DoctorSettingsFieldLabel
          htmlFor={startId}
          icon={CalendarClock}
          iconClassName={iconClass}
          required
        >
          Start
        </DoctorSettingsFieldLabel>
        <Input
          type="datetime-local"
          id={startId}
          value={start}
          onChange={(e) => {
            const nextStart = e.target.value;
            setStart(nextStart);
            if (end && nextStart && end < nextStart) setEnd(nextStart);
          }}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <DoctorSettingsFieldLabel
          htmlFor={endId}
          icon={CalendarClock}
          iconClassName={iconClass}
          required
        >
          End
        </DoctorSettingsFieldLabel>
        <Input
          type="datetime-local"
          id={endId}
          value={end}
          onChange={(e) => {
            const newEnd = e.target.value;
            if (start && newEnd < start) setEnd(start);
            else setEnd(newEnd);
          }}
          disabled={!start}
          min={start || undefined}
          className={inputClass}
        />
      </div>
    </div>
  );
}
