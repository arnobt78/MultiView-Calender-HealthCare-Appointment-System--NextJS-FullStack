"use client";

import type { LucideIcon } from "lucide-react";
import { Calendar, MapPin, Stethoscope, Tag, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { InvoiceVisitSummary } from "@/lib/billing-types";
import { CategoryTableCell } from "@/components/control-panel/patient-detail-snapshot-columns";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { DoctorIdentityCell } from "@/components/shared/person-display/DoctorIdentityCell";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import type { EntityRole } from "@/lib/entity-routes";
import type { RelatedAppointmentsLinkPolicy } from "@/lib/entity-detail-snapshot-links";
import {
  resolveCalendarOwnerLinkKind,
  resolveCategoryLinkEnabled,
  resolveTreatingPhysicianLinkKind,
} from "@/lib/entity-detail-snapshot-links";
import { entityDetailOwnedSnapshotSectionTitle } from "@/lib/entity-detail-snapshot-section-copy";
import {
  entityDetailDefinitionIdentityRowClass,
  entityDetailDefinitionIdentityValueClass,
  entityDetailDefinitionValueClass,
} from "@/lib/patient-detail-ui-classes";
import {
  invoiceDetailCardFrameClass,
  invoiceDetailDefinitionListClass,
  invoiceDetailDefinitionRowClass,
  invoiceDetailFieldIconCircleClass,
  invoiceDetailSectionIconCircleClass,
} from "@/lib/invoice-detail-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  summary: InvoiceVisitSummary;
  appointmentHref: string | null;
  patientHref: string | null;
  viewerRole: EntityRole;
  visitTitle: string;
  /** Portal snapshot link policy — omit on CP for full links. */
  linkPolicy?: RelatedAppointmentsLinkPolicy;
};

function VisitDefinitionRow({
  icon: Icon,
  label,
  identity = false,
  children,
}: {
  icon: LucideIcon;
  label: string;
  /** Patient / physician / owner — center avatar row with label. */
  identity?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={identity ? entityDetailDefinitionIdentityRowClass : invoiceDetailDefinitionRowClass}>
      <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
        <span className={invoiceDetailFieldIconCircleClass} aria-hidden>
          <Icon className="h-3 w-3 text-amber-600" />
        </span>
        {label}
      </dt>
      <dd
        className={
          identity ? entityDetailDefinitionIdentityValueClass : entityDetailDefinitionValueClass
        }
      >
        {children}
      </dd>
    </div>
  );
}

/** Linked visit — inline identity rows parity with appointment detail Related People. */
export function InvoiceLinkedVisitPanel({
  summary,
  appointmentHref,
  patientHref,
  viewerRole,
  visitTitle,
  linkPolicy,
}: Props) {
  const linkPatient = linkPolicy?.patientInTitle ?? true;
  const categoryLinkEnabled = resolveCategoryLinkEnabled(linkPolicy);
  const treatingLinkKind = resolveTreatingPhysicianLinkKind(
    viewerRole,
    linkPolicy,
    summary.treating_physician_role ?? null
  );
  const ownerLinkKind = resolveCalendarOwnerLinkKind(
    viewerRole,
    summary.calendar_owner_role ?? null,
    linkPolicy
  );
  const linkedVisitTitle = entityDetailOwnedSnapshotSectionTitle(
    visitTitle,
    "linkedVisit",
    "appointment"
  );
  const patientPortrait = summary.patient_id
    ? {
        id: summary.patient_id,
        email: summary.patient_email ?? null,
        clinical_profile: summary.patient_clinical_profile ?? null,
        birth_date: summary.patient_birth_date ?? null,
        firstname: summary.patient_label?.split(" ")[0],
        lastname: summary.patient_label?.split(" ").slice(1).join(" "),
      }
    : null;

  return (
    <Card className={cn(invoiceDetailCardFrameClass, "border-amber-100/50 shadow-none")}>
      <CardContent className="space-y-3 p-4 sm:p-5">
        <EntityDetailSnapshotSectionHeading
          icon={Calendar}
          sectionIconCircleClass={invoiceDetailSectionIconCircleClass}
          iconClassName="h-3.5 w-3.5 text-amber-600"
        >
          {linkedVisitTitle}
        </EntityDetailSnapshotSectionHeading>
        <dl className={invoiceDetailDefinitionListClass}>
          <VisitDefinitionRow icon={Calendar} label="Visit">
            {appointmentHref ? (
              <EntityTitleLink href={appointmentHref} label={visitTitle} wrapLabel />
            ) : (
              visitTitle
            )}
            {summary.appointment_type_name ? (
              <span className="mt-1 inline-flex rounded-full border border-sky-200/60 bg-sky-50/80 px-2 py-0.5 text-[10px] font-medium text-sky-900">
                {summary.appointment_type_name}
              </span>
            ) : null}
          </VisitDefinitionRow>
          <VisitDefinitionRow icon={Calendar} label="When">
            <span className="text-muted-foreground">{summary.when_label}</span>
            {summary.is_telehealth ? (
              <span className="mt-1 block">
                <TelehealthSessionBadge />
              </span>
            ) : null}
          </VisitDefinitionRow>
          <VisitDefinitionRow icon={User} label="Patient" identity>
            {summary.patient_label && patientPortrait ? (
              <PatientIdentityCell
                href={patientHref ?? undefined}
                linkPatient={linkPatient}
                name={summary.patient_label}
                email={summary.patient_email}
                patient={patientPortrait}
                layout="inline"
                careLevel={summary.patient_care_level}
              />
            ) : (
              (summary.patient_label ?? "—")
            )}
          </VisitDefinitionRow>
          {summary.treating_physician_label && summary.treating_physician_id ? (
            <VisitDefinitionRow icon={Stethoscope} label="Treating physician" identity>
              <DoctorIdentityCell
                doctorId={summary.treating_physician_id}
                name={summary.treating_physician_label}
                email={summary.treating_physician_email}
                image={summary.treating_physician_image}
                specialty={summary.treating_physician_specialty}
                viewerRole={viewerRole}
                linkKind={treatingLinkKind}
                staffRole={summary.treating_physician_role}
                layout="inline"
                size="sm"
                showRoleBadge
                showSpecialty
              />
            </VisitDefinitionRow>
          ) : null}
          {summary.calendar_owner_label &&
          summary.calendar_owner_id &&
          summary.calendar_owner_label !== summary.treating_physician_label ? (
            <VisitDefinitionRow icon={User} label="Calendar owner" identity>
              <DoctorIdentityCell
                doctorId={summary.calendar_owner_id}
                name={summary.calendar_owner_label}
                email={summary.calendar_owner_email}
                image={summary.calendar_owner_image}
                specialty={summary.calendar_owner_specialty}
                viewerRole={viewerRole}
                linkKind={ownerLinkKind}
                staffRole={summary.calendar_owner_role}
                layout="inline"
                size="sm"
                showRoleBadge
                showSpecialty={summary.calendar_owner_role === "doctor"}
              />
            </VisitDefinitionRow>
          ) : null}
          {summary.category_id ? (
            <VisitDefinitionRow icon={Tag} label="Category">
              <CategoryTableCell
                label={summary.category_label}
                color={summary.category_color}
                icon={summary.category_icon}
                categoryId={categoryLinkEnabled ? summary.category_id : null}
                viewerRole={viewerRole}
                markVariant="brand"
              />
            </VisitDefinitionRow>
          ) : null}
          <VisitDefinitionRow icon={MapPin} label="Location">
            <span className="text-muted-foreground">{summary.location_label}</span>
          </VisitDefinitionRow>
        </dl>
      </CardContent>
    </Card>
  );
}
