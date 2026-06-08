"use client";

import { AppointmentTypeGlassBadge } from "@/components/shared/appointment-display/AppointmentTypeGlassBadge";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
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

  return (
    <div
      className={cn(
        clinicalTableCellMinRowClass,
        clinicalTableCellWrapClass,
        "flex w-full min-w-0 flex-col justify-center gap-1.5 py-1"
      )}
    >
      <div className="flex w-full min-w-0 flex-wrap items-center gap-1.5">
        <EntityTitleLink
          href={href}
          label={title}
          className="min-w-0 flex-1 font-normal"
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
      {ownerDoctor && ownerDoctor.id !== treatingDoctor?.id ? (
        <p className={cn(clinicalCellMutedTextClass, "w-full min-w-0 text-[10px]")}>
          Owner:{" "}
          <EntityTitleLink
            href={
              viewerRole === "admin"
                ? `/control-panel/doctors/${ownerDoctor.id}`
                : `/doctors/${ownerDoctor.id}`
            }
            label={ownerDoctor.display_name ?? "Doctor"}
            className="inline text-[10px] font-normal"
          />
        </p>
      ) : null}
    </div>
  );
}
