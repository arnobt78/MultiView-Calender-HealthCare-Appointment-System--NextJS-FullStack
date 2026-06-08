"use client";

import type { DoctorPortalPatientStatusCounts } from "@/lib/doctor-portal-patients-display";
import {
  PATIENT_ROSTER_STATUS_INLINE_ORDER,
  patientRosterStatusInlineCount,
  patientRosterStatusInlineLabel,
  patientRosterStatusInlineTextClass,
  type PatientRosterStatusInlineKey,
} from "@/lib/patient-roster-status-display";
import { cn } from "@/lib/utils";

type Props = {
  counts: DoctorPortalPatientStatusCounts;
  className?: string;
};

/** Doctor portal patients header — colored Active/Inactive segments with · separators (no outline badge). */
export function PatientRosterStatusCountInlineRow({ counts, className }: Props) {
  return (
    <span
      className={cn("inline-flex min-w-0 flex-wrap items-center gap-x-1 text-xs", className)}
      aria-label={PATIENT_ROSTER_STATUS_INLINE_ORDER.map((key) => {
        const label = patientRosterStatusInlineLabel(key);
        return `${label}: ${patientRosterStatusInlineCount(counts, key)}`;
      }).join(", ")}
    >
      {PATIENT_ROSTER_STATUS_INLINE_ORDER.map((key, index) => (
        <PatientRosterStatusSegment key={key} statusKey={key} count={counts[key]} index={index} />
      ))}
    </span>
  );
}

function PatientRosterStatusSegment({
  statusKey,
  count,
  index,
}: {
  statusKey: PatientRosterStatusInlineKey;
  count: number;
  index: number;
}) {
  const label = patientRosterStatusInlineLabel(statusKey);
  const isActive = statusKey === "active";
  return (
    <span className="inline-flex items-center gap-x-1">
      {index > 0 ? (
        <span className="text-muted-foreground/70" aria-hidden>
          ·
        </span>
      ) : null}
      <span
        className={cn(
          "font-medium tabular-nums",
          patientRosterStatusInlineTextClass(isActive)
        )}
      >
        {label}: {count}
      </span>
    </span>
  );
}
