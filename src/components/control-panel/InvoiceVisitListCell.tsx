"use client";

import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { DoctorIdentityCell } from "@/components/shared/person-display/DoctorIdentityCell";
import { InvoiceVisitSummaryLine } from "@/components/shared/billing/InvoiceVisitSummaryLine";
import type { Invoice } from "@/hooks/usePayments";
import { getInvoiceListTitle } from "@/lib/invoice-list-display";
import { invoiceTreatingDoctorFromSummary } from "@/lib/invoice-visit-doctor";
import { invoiceVisitSummaryToPatientPortrait } from "@/lib/invoice-visit-patient-portrait";
import {
  invoiceDetailHref,
  patientDetailHref,
  type EntityRole,
} from "@/lib/entity-routes";
import { resolveTreatingPhysicianLinkKind } from "@/lib/entity-detail-snapshot-links";
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
 * Compact invoice list cell — title, schedule, patient · treating (no Category/Owner labels).
 */
export function InvoiceVisitListCell({ invoice, viewerRole }: Props) {
  const summary = invoice.visit_summary;
  const title = getInvoiceListTitle(invoice);
  const href = invoiceDetailHref(viewerRole, invoice.id);
  const patientHref = summary?.patient_id
    ? patientDetailHref(viewerRole, summary.patient_id)
    : href;
  const patientPortrait = invoiceVisitSummaryToPatientPortrait(summary);
  const treatingDoctor = invoiceTreatingDoctorFromSummary(summary);

  return (
    <div
      className={cn(
        clinicalTableCellMinRowClass,
        clinicalTableCellWrapClass,
        "flex w-full min-w-0 flex-col justify-center gap-1 py-1"
      )}
    >
      <EntityTitleLink
        href={href}
        label={title}
        className="min-w-0 font-normal"
        wrapLabel
      />
      <InvoiceVisitSummaryLine summary={summary} className="w-full min-w-0" />
      {summary?.patient_label && patientPortrait ? (
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <PatientIdentityCell
            href={patientHref}
            name={summary.patient_label}
            email={summary.patient_email}
            patient={patientPortrait}
            layout="inline"
            avatarSizeClassName="h-6 w-6"
            careLevel={summary.patient_care_level}
            className="min-h-0 shrink py-0"
          />
          {treatingDoctor && summary.treating_physician_id && summary.treating_physician_label ? (
            <>
              <span className={cn(clinicalCellMutedTextClass, "text-[10px]")} aria-hidden>
                ·
              </span>
              <DoctorIdentityCell
                doctorId={summary.treating_physician_id}
                name={summary.treating_physician_label}
                email={summary.treating_physician_email}
                image={summary.treating_physician_image}
                specialty={summary.treating_physician_specialty}
                viewerRole={viewerRole}
                linkKind={resolveTreatingPhysicianLinkKind(
                  viewerRole,
                  undefined,
                  summary.treating_physician_role
                )}
                staffRole={summary.treating_physician_role}
                layout="inline"
                size="sm"
                className="min-h-0 shrink py-0"
              />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
