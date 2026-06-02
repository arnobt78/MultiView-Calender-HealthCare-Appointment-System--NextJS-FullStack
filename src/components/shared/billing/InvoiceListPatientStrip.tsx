"use client";

import { PatientAgeGlassBadge } from "@/components/shared/person-display/PatientAgeGlassBadge";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import { CategoryInlineLink } from "@/components/shared/CategoryInlineLink";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { getPatientCareLevelShortLabel } from "@/lib/patient-care-level";
import { patientAgeYears } from "@/lib/patient-age";
import type { Patient } from "@/types/types";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  email?: string | null;
  birthDate?: string | null;
  careLevel?: number | null;
  patientHref: string;
  patientPortrait: Pick<Patient, "id" | "email" | "clinical_profile"> & {
    firstname?: string;
    lastname?: string;
    birth_date?: string | null;
  };
  categoryId?: string | null;
  categoryLabel?: string | null;
  categoryColor?: string | null;
  categoryIcon?: string | null;
  className?: string;
};

/** Avatar + patient fields + optional category (inline, wraps on narrow screens). */
export function InvoiceListPatientStrip({
  name,
  email,
  birthDate,
  careLevel,
  patientHref,
  patientPortrait,
  categoryId,
  categoryLabel,
  categoryColor,
  categoryIcon,
  className,
}: Props) {
  const label = name.trim() || "Patient";
  const emailTrim = email?.trim();
  const age = patientAgeYears(birthDate);
  const careLabel =
    careLevel != null && !Number.isNaN(Number(careLevel))
      ? getPatientCareLevelShortLabel(careLevel)
      : null;

  return (
    <div className={cn("flex min-w-0 gap-2", className)}>
      <PatientPortraitAvatar patient={patientPortrait} sizeClassName="h-7 w-7" className="shrink-0" />
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
        <EntityTitleLink href={patientHref} label={label} className="text-xs font-normal" />
        {emailTrim ? (
          <span className="min-w-0 truncate text-muted-foreground" title={emailTrim}>
            {emailTrim}
          </span>
        ) : null}
        {age != null ? <PatientAgeGlassBadge age={age} compact /> : null}
        {careLabel ? <span className="text-muted-foreground">{careLabel}</span> : null}
        {categoryLabel && categoryId ? (
          <CategoryInlineLink
            categoryId={categoryId}
            label={categoryLabel}
            color={categoryColor}
            icon={categoryIcon}
            markSize="compact"
            linkClassName="font-normal"
            className="shrink-0"
          />
        ) : null}
      </div>
    </div>
  );
}
