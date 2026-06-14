"use client";

import { PatientAgeGlassBadge } from "@/components/shared/person-display/PatientAgeGlassBadge";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import {
  clinicalCellMutedTextClass,
  clinicalStackGapClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import { patientAgeYears } from "@/lib/patient-age";
import { getPatientCareLevelShortLabel } from "@/lib/patient-care-level";
import {
  patientSelectDisplayName,
  patientSelectPrimaryDoctorLabel,
  type PatientSelectDisplayInput,
} from "@/lib/patient-select-display";
import { cn } from "@/lib/utils";

/** Taller Radix item — two text rows + portrait; pair with `patientSelectItemClass`. */
export const patientSelectItemClass = cn(
  "items-start py-2.5",
  "[&_[data-slot=select-item-text]]:block [&_[data-slot=select-item-text]]:w-full [&_[data-slot=select-item-text]]:text-left",
  "*:[span]:last:items-start *:[span]:last:flex-col *:[span]:last:gap-1 *:[span]:last:text-left"
);

type PatientSelectOptionProps = {
  patient: PatientSelectDisplayInput;
  className?: string;
  /**
   * `h-11` Select trigger — two tight rows (name/age + tier/doctor) inside fixed trigger height.
   * List items use default (taller) layout.
   */
  compact?: boolean;
};

/**
 * Client/Patient `<SelectItem>` row — portrait + name/age, then care tier · primary doctor.
 * Data comes from `GET /api/patients` (`primary_doctor_display`, `care_level`, `birth_date`).
 */
export function PatientSelectOption({
  patient,
  className,
  compact = false,
}: PatientSelectOptionProps) {
  const name = patientSelectDisplayName(patient);
  const age = patientAgeYears(patient.birth_date);
  const tier = getPatientCareLevelShortLabel(patient.care_level);
  const doctor = patientSelectPrimaryDoctorLabel(patient);

  const metaLine = `${tier} · ${doctor}`;

  return (
    <span
      className={cn(
        "flex w-full min-w-0 gap-2",
        compact ? "items-center py-0" : cn("items-start", clinicalTableCellMinRowClass),
        className
      )}
    >
      <PatientPortraitAvatar
        patient={patient}
        sizeClassName={compact ? "h-8 w-8" : "h-10 w-10"}
      />
      <span
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-hidden text-left",
          compact ? "items-start justify-center gap-0 leading-none" : cn("justify-center", clinicalStackGapClass)
        )}
      >
        <span
          className={cn(
            "flex w-full min-w-0 items-center justify-start gap-1",
            !compact && "flex-wrap gap-1.5"
          )}
        >
          <span
            className={cn(
              "truncate text-left font-medium text-gray-700",
              compact ? "text-xs leading-tight" : "text-sm"
            )}
          >
            {name}
          </span>
          {age != null ? <PatientAgeGlassBadge age={age} compact={compact} /> : null}
        </span>
        <span
          className={cn(
            "block w-full min-w-0 text-left text-muted-foreground",
            compact
              ? "truncate text-[10px] leading-tight"
              : cn("line-clamp-2 break-words", clinicalCellMutedTextClass)
          )}
          title={metaLine}
        >
          <span>{tier}</span>
          <span className="text-muted-foreground/80"> · </span>
          <span>{doctor}</span>
        </span>
      </span>
    </span>
  );
}
