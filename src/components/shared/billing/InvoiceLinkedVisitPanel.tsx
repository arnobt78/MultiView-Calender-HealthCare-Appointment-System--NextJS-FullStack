"use client";

import type { LucideIcon } from "lucide-react";
import { Calendar, MapPin, Stethoscope, Tag, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { InvoiceVisitSummary } from "@/lib/billing-types";
import { CategoryTableCell } from "@/components/control-panel/patient-detail-snapshot-columns";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import type { EntityRole } from "@/lib/entity-routes";
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
};

function VisitDefinitionRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={invoiceDetailDefinitionRowClass}>
      <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
        <span className={invoiceDetailFieldIconCircleClass} aria-hidden>
          <Icon className="h-3 w-3 text-amber-600" />
        </span>
        {label}
      </dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}

/** Linked visit — patient detail schema with sky entity links. */
export function InvoiceLinkedVisitPanel({
  summary,
  appointmentHref,
  patientHref,
  viewerRole,
  visitTitle,
}: Props) {
  const patientPortrait = summary.patient_id
    ? {
        id: summary.patient_id,
        email: summary.patient_email ?? null,
        clinical_profile: null,
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
          Linked visit
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
          <VisitDefinitionRow icon={User} label="Patient">
            {summary.patient_label && patientPortrait && patientHref ? (
              <PatientIdentityCell
                href={patientHref}
                name={summary.patient_label}
                email={summary.patient_email}
                patient={patientPortrait}
                layout="detail"
              />
            ) : (
              (summary.patient_label ?? "—")
            )}
          </VisitDefinitionRow>
          {summary.treating_physician_label ? (
            <VisitDefinitionRow icon={Stethoscope} label="Treating physician">
              <DoctorIdentityRow
                doctor={{
                  id: summary.treating_physician_id ?? "unknown",
                  display_name: summary.treating_physician_label,
                  email: null,
                  specialty: summary.treating_physician_specialty,
                  image: null,
                }}
                linkKind={viewerRole === "admin" ? "admin-cp" : "role"}
                layout="inline"
                showEmail={false}
              />
            </VisitDefinitionRow>
          ) : null}
          {summary.calendar_owner_label &&
          summary.calendar_owner_label !== summary.treating_physician_label ? (
            <VisitDefinitionRow icon={User} label="Calendar owner">
              <DoctorIdentityRow
                doctor={{
                  id: summary.calendar_owner_id ?? "unknown",
                  display_name: summary.calendar_owner_label,
                  email: null,
                  specialty: summary.calendar_owner_specialty,
                  image: null,
                }}
                linkKind={viewerRole === "admin" ? "admin-cp" : "role"}
                layout="inline"
                showEmail={false}
              />
            </VisitDefinitionRow>
          ) : null}
          {summary.category_id ? (
            <VisitDefinitionRow icon={Tag} label="Category">
              <CategoryTableCell
                label={summary.category_label}
                color={summary.category_color}
                icon={summary.category_icon}
                categoryId={summary.category_id}
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
