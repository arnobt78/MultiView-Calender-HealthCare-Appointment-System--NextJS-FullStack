"use client";

import { InvoiceVisitTitleRow } from "@/components/shared/billing/InvoiceVisitTitleRow";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { DoctorIdentityCell } from "@/components/shared/person-display/DoctorIdentityCell";
import { StaffUserIdentityCell } from "@/components/shared/person-display/StaffUserIdentityCell";
import { InvoiceVisitSummaryLine } from "@/components/shared/billing/InvoiceVisitSummaryLine";
import type { Invoice } from "@/hooks/usePayments";
import { getInvoiceListTitle } from "@/lib/invoice-list-display";
import {
  invoiceTreatingDoctorFromSummary,
} from "@/lib/invoice-visit-doctor";
import { invoiceVisitSummaryToPatientPortrait } from "@/lib/invoice-visit-patient-portrait";
import {
  invoiceDetailHref,
  patientDetailHref,
  userDetailHref,
  type EntityRole,
} from "@/lib/entity-routes";
import { resolveInvoiceVisitTitleHref } from "@/lib/invoice-visit-title-href";
import {
  resolveCalendarOwnerLinkKind,
  resolveTreatingPhysicianLinkKind,
} from "@/lib/entity-detail-snapshot-links";
import { isAdminRole } from "@/lib/rbac";
import {
  clinicalTableCellMinRowClass,
  clinicalTableCellWrapClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  viewerRole: EntityRole;
};

/**
 * CP invoice list description — title, schedule, then compactStack patient / doctor / admin blocks.
 */
export function InvoiceVisitListCell({ invoice, viewerRole }: Props) {
  const summary = invoice.visit_summary;
  const title = getInvoiceListTitle(invoice);
  const href = resolveInvoiceVisitTitleHref(invoice, viewerRole);
  const patientHref = summary?.patient_id
    ? patientDetailHref(viewerRole, summary.patient_id)
    : href;
  const patientPortrait = invoiceVisitSummaryToPatientPortrait(summary);
  const treatingDoctor = invoiceTreatingDoctorFromSummary(summary);
  const ownerLinkKind = summary
    ? resolveCalendarOwnerLinkKind(viewerRole, summary.calendar_owner_role)
    : "role";

  const showOwnerBlock =
    summary?.calendar_owner_id && summary.calendar_owner_label;

  const ownerIsAdmin = isAdminRole(summary?.calendar_owner_role);

  return (
    <div
      className={cn(
        clinicalTableCellMinRowClass,
        clinicalTableCellWrapClass,
        "flex w-full min-w-0 flex-col justify-center gap-1 py-1"
      )}
    >
      <InvoiceVisitTitleRow
        href={href}
        title={title}
        invoice={invoice}
        wrapLabel
      />
      <InvoiceVisitSummaryLine summary={summary} className="w-full min-w-0" />
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        {summary?.patient_label && patientPortrait ? (
          <PatientIdentityCell
            href={patientHref}
            name={summary.patient_label}
            email={summary.patient_email}
            patient={patientPortrait}
            layout="compactStack"
            avatarSizeClassName="h-6 w-6"
            careLevel={summary.patient_care_level}
            className="min-h-0 py-0"
          />
        ) : null}
        {summary &&
        treatingDoctor &&
        summary.treating_physician_id &&
        summary.treating_physician_label ? (
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
            layout="compactStack"
            size="sm"
            showSpecialty
            showRoleBadge={false}
            className="min-h-0 py-0"
          />
        ) : null}
        {showOwnerBlock && summary ? (
          ownerIsAdmin ? (
            <StaffUserIdentityCell
              displayName={summary.calendar_owner_label!}
              email={summary.calendar_owner_email}
              image={summary.calendar_owner_image}
              href={userDetailHref(viewerRole, summary.calendar_owner_id!)}
              role={summary.calendar_owner_role}
              showRoleBadge
              layout="compactStack"
              avatarSizeClassName="h-6 w-6"
              className="min-h-0 py-0"
            />
          ) : (
            <DoctorIdentityCell
              doctorId={summary.calendar_owner_id!}
              name={summary.calendar_owner_label!}
              email={summary.calendar_owner_email}
              image={summary.calendar_owner_image}
              specialty={summary.calendar_owner_specialty}
              viewerRole={viewerRole}
              linkKind={ownerLinkKind}
              staffRole={summary.calendar_owner_role}
              layout="compactStack"
              size="sm"
              showSpecialty
              showRoleBadge={false}
              className="min-h-0 py-0"
            />
          )
        ) : null}
      </div>
    </div>
  );
}
