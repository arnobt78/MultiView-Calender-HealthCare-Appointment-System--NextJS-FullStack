"use client";

import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import {
  clinicalCellMutedTextClass,
  clinicalStackGapClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/types";

type PatientPortraitInput = Pick<Patient, "id" | "email" | "clinical_profile"> & {
  firstname?: string;
  lastname?: string;
};

type PatientIdentityCellProps = {
  name: string;
  email?: string | null;
  href: string;
  patient: PatientPortraitInput;
  /** `table` = avatar left + stacked name/email; `detail` = name + email on one row, no avatar column split */
  layout?: "table" | "detail";
  className?: string;
  avatarSizeClassName?: string;
};

/**
 * Reusable patient row for TanStack tables — matches patient-management name column rhythm.
 */
export function PatientIdentityCell({
  name,
  email,
  href,
  patient,
  layout = "table",
  className,
  avatarSizeClassName = "h-9 w-9",
}: PatientIdentityCellProps) {
  const emailTrim = email?.trim();
  const label = name.trim() || emailTrim || "—";

  if (layout === "detail") {
    return (
      <div className={cn("flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
        <EntityTitleLink href={href} label={label} className="font-normal" />
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
        "flex min-w-0 flex-row items-center gap-3",
        clinicalTableCellMinRowClass,
        className
      )}
    >
      <PatientPortraitAvatar patient={patient} sizeClassName={avatarSizeClassName} />
      <div className={cn("flex min-w-0 flex-1 flex-col justify-center", clinicalStackGapClass)}>
        <EntityTitleLink href={href} label={label} className="min-w-0 self-start truncate font-normal" />
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
