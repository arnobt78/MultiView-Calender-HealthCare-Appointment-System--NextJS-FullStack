"use client";

import { UserRound } from "lucide-react";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { PatientAgeGlassBadge } from "@/components/shared/person-display/PatientAgeGlassBadge";
import { PatientCareTierGlassBadge } from "@/components/shared/person-display/PatientCareTierGlassBadge";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import { patientDetailHref, type EntityRole } from "@/lib/entity-routes";
import { patientAgeYears } from "@/lib/patient-age";
import type { DashboardOverviewQueuePatient } from "@/lib/dashboard-overview-queue";
import { cn } from "@/lib/utils";

type Props = {
  patient: DashboardOverviewQueuePatient;
  className?: string;
  /** Role-aware patient chart href — defaults to admin CP route. */
  viewerRole?: EntityRole;
};

/** Inline patient row — avatar, sky link name, age + care tier badges. */
export function DashboardPatientIdentityInline({ patient, className, viewerRole = "admin" }: Props) {
  const age = patientAgeYears(patient.birth_date);
  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-0.5",
        className
      )}
    >
      <UserRound className="h-3.5 w-3.5 shrink-0 text-sky-600/85" aria-hidden />
      <PatientPortraitAvatar
        patient={{
          id: patient.id,
          email: patient.email,
          clinical_profile: patient.clinical_profile,
        }}
        sizeClassName="h-6 w-6"
        className="shrink-0"
      />
      <EntityTitleLink
        href={patientDetailHref(viewerRole, patient.id)}
        label={patient.name}
        className="text-xs font-medium"
      />
      {age != null ? <PatientAgeGlassBadge age={age} compact /> : null}
      <PatientCareTierGlassBadge careLevel={patient.care_level} compact />
    </span>
  );
}
