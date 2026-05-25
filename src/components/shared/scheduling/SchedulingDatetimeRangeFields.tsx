"use client";

import { useEffect } from "react";
import { CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  glassDatetimeLocalInputClass,
  glassDatetimeLocalInputClassAmber,
} from "@/lib/scheduling-glass-input-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";

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
 * Start/End datetime-local pair — end disabled until start set; end min follows start.
 * Shared by appointment manual override and doctor time-off forms.
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
  useEffect(() => {
    if (tone !== "amber") return;
    const el = document.getElementById(startId);
    if (!el) return;
    const cs = getComputedStyle(el);
    // #region agent log
    fetch("http://127.0.0.1:7938/ingest/15849825-35e9-4832-9975-ca3563c056ec", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8bb90b" },
      body: JSON.stringify({
        sessionId: "8bb90b",
        runId: "pre-fix",
        hypothesisId: "H2",
        location: "SchedulingDatetimeRangeFields.tsx:useEffect",
        message: "datetime-local computed styles",
        data: {
          boxShadow: cs.boxShadow,
          borderColor: cs.borderColor,
          height: cs.height,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [tone, startId]);

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
      <div className="space-y-2">
        <Label htmlFor={startId} className="flex items-center gap-1.5 text-gray-700">
          <CalendarClock className={cn("h-3.5 w-3.5", tone === "amber" ? "text-amber-600" : "text-sky-600")} />
          {toTitleCaseLabel("Start")} *
        </Label>
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
      <div className="space-y-2">
        <Label htmlFor={endId} className="flex items-center gap-1.5 text-gray-700">
          <CalendarClock className={cn("h-3.5 w-3.5", tone === "amber" ? "text-amber-600" : "text-sky-600")} />
          {toTitleCaseLabel("End")} *
        </Label>
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
