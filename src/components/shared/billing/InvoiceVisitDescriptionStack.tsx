"use client";

import { AppointmentTypeGlassBadge } from "@/components/shared/appointment-display/AppointmentTypeGlassBadge";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { DoctorIdentityCell } from "@/components/shared/person-display/DoctorIdentityCell";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { CategoryInlineLink } from "@/components/shared/CategoryInlineLink";
import { InvoiceVisitSummaryLine } from "@/components/shared/billing/InvoiceVisitSummaryLine";
import type { Invoice } from "@/hooks/usePayments";
import { getInvoiceListTitle } from "@/lib/invoice-list-display";
import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDurationMinutes,
  resolveAppointmentTypeDisplayName,
} from "@/lib/appointment-type-display";
import { resolveCalendarOwnerLinkKind } from "@/lib/entity-detail-snapshot-links";
import {
  invoiceCalendarOwnerDoctorFromSummary,
  invoiceTreatingDoctorFromSummary,
} from "@/lib/invoice-visit-doctor";
import { invoiceVisitSummaryToPatientPortrait } from "@/lib/invoice-visit-patient-portrait";
import {
  invoiceDetailHref,
  patientDetailHref,
  type EntityRole,
} from "@/lib/entity-routes";
import {
  clinicalCellMutedTextClass,
  clinicalTableCellMinRowClass,
  clinicalTableCellWrapClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  viewerRole: EntityRole;
};

/**
 * Shared invoice description column — title, schedule, inline patient row,
 * doctor + category on one responsive wrap row (appointment detail + list tables).
 */
export function InvoiceVisitDescriptionStack({ invoice, viewerRole }: Props) {
  const summary = invoice.visit_summary;
  const title = getInvoiceListTitle(invoice);
  const href = invoiceDetailHref(viewerRole, invoice.id);

  const patientHref = summary?.patient_id
    ? patientDetailHref(viewerRole, summary.patient_id)
    : href;

  const patientPortrait = invoiceVisitSummaryToPatientPortrait(summary);
  const typeName = summary ? resolveAppointmentTypeDisplayName(summary) : null;
  const typeDurationLabel = summary
    ? formatAppointmentTypeDurationLabel(resolveAppointmentTypeDurationMinutes(summary))
    : null;

  const treatingDoctor = invoiceTreatingDoctorFromSummary(summary);
  const ownerDoctor = invoiceCalendarOwnerDoctorFromSummary(summary);
  const ownerLinkKind = summary
    ? resolveCalendarOwnerLinkKind(viewerRole, summary.calendar_owner_role)
    : "role";

  return (
    <div
      className={cn(
        clinicalTableCellMinRowClass,
        clinicalTableCellWrapClass,
        "flex w-full min-w-0 flex-col justify-center gap-1.5 py-1"
      )}
    >
      <div className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <EntityTitleLink
          href={href}
          label={title}
          className="min-w-0 shrink font-normal"
          wrapLabel
        />
        {typeName ? (
          <AppointmentTypeGlassBadge
            name={typeName}
            durationLabel={typeDurationLabel}
            className="shrink-0"
          />
        ) : null}
      </div>
      <InvoiceVisitSummaryLine summary={summary} className="w-full min-w-0" />
      {summary?.patient_label && patientPortrait ? (
        <PatientIdentityCell
          href={patientHref}
          name={summary.patient_label}
          email={summary.patient_email}
          patient={patientPortrait}
          layout="inline"
          avatarSizeClassName="h-7 w-7"
          careLevel={summary.patient_care_level}
          className="w-full min-w-0 py-0"
        />
      ) : null}
      {treatingDoctor || summary?.category_id ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          {treatingDoctor ? (
            <DoctorIdentityRow
              doctor={treatingDoctor}
              linkKind={viewerRole === "admin" ? "admin-cp" : "role"}
              layout="inline"
              size="sm"
              showEmail
              className="min-h-0 shrink-0 py-0"
            />
          ) : null}
          {summary?.category_id && summary.category_label ? (
            <CategoryInlineLink
              categoryId={summary.category_id}
              label={summary.category_label}
              color={summary.category_color}
              icon={summary.category_icon}
              markSize="compact"
              className="shrink-0"
            />
          ) : null}
        </div>
      ) : null}
      {ownerDoctor &&
      summary?.calendar_owner_id &&
      summary.calendar_owner_label &&
      ownerDoctor.id !== treatingDoctor?.id ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              clinicalCellMutedTextClass,
              "shrink-0 text-[10px] font-medium"
            )}
          >
            Owner:
          </span>
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
            className="min-h-0 shrink py-0"
          />
        </div>
      ) : null}
    </div>
  );
}
