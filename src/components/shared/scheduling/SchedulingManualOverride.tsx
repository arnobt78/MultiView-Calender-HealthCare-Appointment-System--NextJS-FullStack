"use client";

import { Siren } from "lucide-react";
import { GlassCollapsibleDetails } from "@/components/shared/GlassCollapsibleDetails";
import { SchedulingDatetimeRangeFields } from "@/components/shared/scheduling/SchedulingDatetimeRangeFields";
import { toTitleCaseLabel } from "@/lib/utils";

type SchedulingManualOverrideProps = {
  start: string;
  setStart: (v: string) => void;
  end: string;
  setEnd: (v: string) => void;
};

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
    <GlassCollapsibleDetails
      tone="sky"
      icon={Siren}
      title={toTitleCaseLabel(
        "Advanced Appointment Scheduling: custom date & time override for emergency cases as manual override (Optional)"
      )}
      bodyClassName="space-y-3"
    >
        <p className="text-xs leading-relaxed text-muted-foreground">
          Optional — for emergency when no availability slot fits. Must not overlap existing
          appointments for this calendar owner.
        </p>
        <SchedulingDatetimeRangeFields
          start={start}
          setStart={setStart}
          end={end}
          setEnd={setEnd}
          startId="sched-manual-start"
          endId="sched-manual-end"
        />
    </GlassCollapsibleDetails>
  );
}
