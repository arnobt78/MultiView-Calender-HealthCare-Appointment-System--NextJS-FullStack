"use client";

import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { PatientAgeGlassBadge } from "@/components/shared/person-display/PatientAgeGlassBadge";
import { PatientCareTierGlassBadge } from "@/components/shared/person-display/PatientCareTierGlassBadge";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import {
  clinicalIdentityInlineAvatarClass,
  clinicalIdentityInlineBadgeRowClass,
  clinicalIdentityInlineInnerClass,
  clinicalIdentityInlineNameClass,
  clinicalIdentityInlineRowClass,
} from "@/lib/clinical-identity-inline-ui";
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
  /** Inline layout — care tier badge beside age (entity detail Related People). */
  careLevel?: number | null;
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
  avatarSizeClassName,
  careLevel,
}: PatientIdentityCellProps) {
  const resolvedAvatarSize =
    avatarSizeClassName ??
    (layout === "inline" ? clinicalIdentityInlineAvatarClass : "h-9 w-9");
  const emailTrim = email?.trim();
  const label = name.trim() || emailTrim || "—";
  const age = patientAgeYears(patient.birth_date);
  const canLink = linkPatient && Boolean(href?.trim());

  const tableNameNode = canLink ? (
    <EntityTitleLink href={href!} label={label} className="min-w-0 self-start truncate font-normal" />
  ) : (
    <span className="min-w-0 self-start truncate font-normal text-foreground">{label}</span>
  );

  const inlineNameNode = canLink ? (
    <EntityTitleLink href={href!} label={label} className={clinicalIdentityInlineNameClass} />
  ) : (
    <span className={cn(clinicalIdentityInlineNameClass, "text-foreground")}>{label}</span>
  );

  const inlineBadgeRow =
    age != null || careLevel != null ? (
      <div className={clinicalIdentityInlineBadgeRowClass}>
        {age != null ? <PatientAgeGlassBadge age={age} compact /> : null}
        {careLevel != null ? (
          <PatientCareTierGlassBadge careLevel={careLevel} compact className="shrink-0" />
        ) : null}
      </div>
    ) : null;

  if (layout === "inline") {
    return (
      <div className={cn(clinicalIdentityInlineRowClass, className)}>
        <PatientPortraitAvatar patient={patient} sizeClassName={resolvedAvatarSize} />
        <div className={clinicalIdentityInlineInnerClass}>
          {inlineNameNode}
          {emailTrim ? (
            <span className={cn("shrink-0", clinicalCellMutedTextClass)} title={emailTrim}>
              ({emailTrim})
            </span>
          ) : null}
          {inlineBadgeRow}
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
      <PatientPortraitAvatar patient={patient} sizeClassName={resolvedAvatarSize} />
      <div className={cn("flex min-w-0 flex-1 flex-col justify-center", clinicalStackGapClass)}>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {tableNameNode}
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
