"use client";

import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { CategoryInlineLink } from "@/components/shared/CategoryInlineLink";
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
        "flex min-w-0 flex-col justify-center gap-1.5 py-1"
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
            className="calendar-glass-badge calendar-glass-badge-sky shrink-0 py-0 text-[10px] capitalize"
          >
            {summary.appointment_type_name}
          </Badge>
        ) : null}
        {summary?.is_telehealth ? <TelehealthSessionBadge /> : null}
      </div>
      {dateLabel || timeLabel ? (
        <p className={cn(clinicalCellMutedTextClass, "flex min-w-0 flex-wrap items-center gap-1 text-xs")}>
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
          layout="inline"
          avatarSizeClassName="h-7 w-7"
          className="min-h-0 py-0"
        />
      ) : null}
      {treatingDoctor || summary?.category_id ? (
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
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
    </div>
  );
}
