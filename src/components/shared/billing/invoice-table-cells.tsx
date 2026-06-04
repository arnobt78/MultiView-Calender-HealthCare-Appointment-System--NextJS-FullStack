"use client";

import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { CategoryTableCell } from "@/components/control-panel/patient-detail-snapshot-columns";
import { InvoiceIssuedByMeta } from "@/components/shared/billing/InvoiceIssuedByMeta";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import type { Invoice } from "@/hooks/usePayments";
import { getInvoiceListTitle } from "@/lib/invoice-list-display";
import {
  formatInvoiceVisitDateLabel,
  formatInvoiceVisitTimeRange,
} from "@/lib/invoice-list-row-display";
import {
  invoiceCalendarOwnerDoctorFromSummary,
  invoiceTreatingDoctorFromSummary,
} from "@/lib/invoice-visit-doctor";
import {
  invoiceDetailHref,
  patientDetailHref,
  type EntityRole,
} from "@/lib/entity-routes";
import { invoiceDueDateTextClassForStatus } from "@/lib/invoice-status-display";
import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import {
  clinicalCellMutedTextClass,
  clinicalTableCellMinRowClass,
  clinicalTableCellWrapClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type InvoiceTableCellsProps = {
  invoice: Invoice;
  viewerRole: EntityRole;
};

/** Sky link — short invoice id. */
export function InvoiceNumberTableCell({ invoice, viewerRole }: InvoiceTableCellsProps) {
  const href = invoiceDetailHref(viewerRole, invoice.id);
  const shortId = `#${invoice.id.slice(0, 8)}`;
  return (
    <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
      <EntityTitleLink href={href} label={shortId} className="font-mono text-xs font-normal" />
    </div>
  );
}

/** Stacked visit context — title, type badge, when, patient, doctors, category. */
export function InvoiceDescriptionTableCell({ invoice, viewerRole }: InvoiceTableCellsProps) {
  const summary = invoice.visit_summary;
  const title = getInvoiceListTitle(invoice);
  const href = invoiceDetailHref(viewerRole, invoice.id);
  const dateLabel =
    summary?.start_iso ? formatInvoiceVisitDateLabel(summary.start_iso) : null;
  const timeLabel =
    summary?.start_iso && summary?.end_iso
      ? formatInvoiceVisitTimeRange(summary.start_iso, summary.end_iso)
      : null;

  const patientHref = summary?.patient_id
    ? patientDetailHref(viewerRole, summary.patient_id)
    : href;

  const patientPortrait = summary?.patient_id
    ? {
        id: summary.patient_id,
        email: summary.patient_email ?? null,
        clinical_profile: null,
        birth_date: summary.patient_birth_date ?? null,
        firstname: summary.patient_label?.split(" ")[0],
        lastname: summary.patient_label?.split(" ").slice(1).join(" "),
      }
    : null;

  const treatingDoctor = invoiceTreatingDoctorFromSummary(summary);
  const ownerDoctor = invoiceCalendarOwnerDoctorFromSummary(summary);

  return (
    <div
      className={cn(
        clinicalTableCellMinRowClass,
        clinicalTableCellWrapClass,
        "flex min-w-0 flex-col justify-center gap-1 py-1"
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <EntityTitleLink
          href={href}
          label={title}
          className="block max-w-[240px] font-normal"
          wrapLabel
        />
        {summary?.appointment_type_name ? (
          <Badge
            variant="outline"
            className="calendar-glass-badge calendar-glass-badge-sky shrink-0 text-[10px] py-0 capitalize"
          >
            {summary.appointment_type_name}
          </Badge>
        ) : null}
        {summary?.is_telehealth ? <TelehealthSessionBadge /> : null}
      </div>
      {dateLabel || timeLabel ? (
        <p className={cn(clinicalCellMutedTextClass, "flex flex-wrap items-center gap-1 text-xs")}>
          {dateLabel ? <span>{dateLabel}</span> : null}
          {timeLabel ? (
            <>
              {dateLabel ? <span aria-hidden>·</span> : null}
              <Clock className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
              <span>{timeLabel}</span>
            </>
          ) : null}
        </p>
      ) : null}
      {summary?.patient_label && patientPortrait ? (
        <PatientIdentityCell
          href={patientHref}
          name={summary.patient_label}
          email={summary.patient_email}
          patient={patientPortrait}
          avatarSizeClassName="h-7 w-7"
          className="min-h-0 items-start gap-1.5 py-0"
        />
      ) : null}
      {treatingDoctor ? (
        <DoctorIdentityRow
          doctor={treatingDoctor}
          linkKind={viewerRole === "admin" ? "admin-cp" : "role"}
          size="sm"
          showEmail={false}
          className="min-h-0 py-0"
        />
      ) : null}
      {ownerDoctor ? (
        <p className={cn(clinicalCellMutedTextClass, "text-[10px]")}>
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
      {summary?.category_id ? (
        <CategoryTableCell
          label={summary.category_label}
          color={summary.category_color}
          icon={summary.category_icon}
          categoryId={summary.category_id}
          viewerRole={viewerRole}
          markVariant="brand"
          markSize="compact"
        />
      ) : null}
    </div>
  );
}

export function InvoiceDueTableCell({ invoice }: { invoice: Invoice }) {
  const displayStatus = resolveInvoiceDisplayStatus(invoice);
  if (!invoice.due_date) {
    return (
      <span className={cn(clinicalCellMutedTextClass, "text-xs")}>—</span>
    );
  }
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        invoiceDueDateTextClassForStatus(displayStatus)
      )}
    >
      {format(new Date(invoice.due_date), "dd MMM yyyy")}
    </span>
  );
}

export function InvoiceCreatedTableCell({ invoice }: { invoice: Invoice }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 py-0.5">
      <span className={cn(clinicalCellMutedTextClass, "text-xs tabular-nums")}>
        {format(new Date(invoice.created_at), "dd MMM yyyy")}
      </span>
      <InvoiceIssuedByMeta
        createdAt={invoice.created_at}
        issuerLabel={invoice.issuer_label}
        issuerImage={invoice.issuer_image}
      />
    </div>
  );
}
