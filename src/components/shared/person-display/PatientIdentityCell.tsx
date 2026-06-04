"use client";

import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { PatientAgeGlassBadge } from "@/components/shared/person-display/PatientAgeGlassBadge";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import { patientAgeYears } from "@/lib/patient-age";
import {
  clinicalCellMutedTextClass,
  clinicalStackGapClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/types";

type PatientPortraitInput = Pick<Patient, "id" | "email" | "clinical_profile" | "birth_date"> & {
  firstname?: string;
  lastname?: string;
};

type PatientIdentityCellProps = {
  name: string;
  email?: string | null;
  /** Omit or set `linkPatient={false}` for read-only snapshot rows (portal doctor detail). */
  href?: string;
  linkPatient?: boolean;
  patient: PatientPortraitInput;
  /**
   * `table` = avatar + stacked name/age + email;
   * `detail` = name + email baseline row (no avatar);
   * `inline` = avatar + name + age + email on one responsive wrap row.
   */
  layout?: "table" | "detail" | "inline";
  className?: string;
  avatarSizeClassName?: string;
};

/**
 * Reusable patient row for TanStack tables — name row matches appointment client picker
 * (`PatientSelectOption` + `PatientAgeGlassBadge`); email stays on the line below.
 */
export function PatientIdentityCell({
  name,
  email,
  href,
  linkPatient = true,
  patient,
  layout = "table",
  className,
  avatarSizeClassName = "h-9 w-9",
}: PatientIdentityCellProps) {
  const emailTrim = email?.trim();
  const label = name.trim() || emailTrim || "—";
  const age = patientAgeYears(patient.birth_date);
  const canLink = linkPatient && Boolean(href?.trim());

  const nameNode = canLink ? (
    <EntityTitleLink href={href!} label={label} className="min-w-0 self-start truncate font-normal" />
  ) : (
    <span className="min-w-0 self-start truncate font-normal text-foreground">{label}</span>
  );

  if (layout === "inline") {
    return (
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1",
          clinicalTableCellMinRowClass,
          className
        )}
      >
        <PatientPortraitAvatar patient={patient} sizeClassName={avatarSizeClassName} />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
          {nameNode}
          {age != null ? <PatientAgeGlassBadge age={age} /> : null}
          {emailTrim ? (
            <span className={cn("truncate", clinicalCellMutedTextClass)} title={emailTrim}>
              ({emailTrim})
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  if (layout === "detail") {
    return (
      <div className={cn("flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
        {canLink ? (
          <EntityTitleLink href={href!} label={label} className="font-normal" />
        ) : (
          <span className="font-normal text-foreground">{label}</span>
        )}
        {emailTrim ? (
          <span className={cn("truncate", clinicalCellMutedTextClass)} title={emailTrim}>
            {emailTrim}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-row items-center gap-2",
        clinicalTableCellMinRowClass,
        className
      )}
    >
      <PatientPortraitAvatar patient={patient} sizeClassName={avatarSizeClassName} />
      <div className={cn("flex min-w-0 flex-1 flex-col justify-center", clinicalStackGapClass)}>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {nameNode}
          {age != null ? <PatientAgeGlassBadge age={age} /> : null}
        </div>
        {emailTrim ? (
          <span className={cn("truncate", clinicalCellMutedTextClass)} title={emailTrim}>
            {emailTrim}
          </span>
        ) : (
          <span className={clinicalCellMutedTextClass}>—</span>
        )}
      </div>
    </div>
  );
}
