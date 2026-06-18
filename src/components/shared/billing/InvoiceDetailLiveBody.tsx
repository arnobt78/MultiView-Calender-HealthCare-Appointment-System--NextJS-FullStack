"use client";

import type { LucideIcon } from "lucide-react";
import { CreditCard, Euro, FileText, Fingerprint, Receipt, Stethoscope } from "lucide-react";
import { useMemo } from "react";
import { useInvoice } from "@/hooks/useInvoice";
import type { Invoice } from "@/hooks/usePayments";
import type { EntityRole } from "@/lib/entity-routes";
import {
  appointmentDetailHref,
  patientDetailHref,
} from "@/lib/entity-routes";
import { Card, CardContent } from "@/components/ui/card";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { InvoiceDetailActionBar } from "@/components/shared/billing/InvoiceDetailActionBar";
import { InvoiceDetailHeaderActions } from "@/components/shared/billing/InvoiceDetailHeaderActions";
import { resolvePortalAppointmentDetailLinkPolicy } from "@/lib/entity-detail-snapshot-links";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceLinkedVisitPanel } from "@/components/shared/billing/InvoiceLinkedVisitPanel";
import { InvoicePaymentHistoryTable } from "@/components/shared/billing/InvoicePaymentHistoryTable";
import { AppointmentTypeGlassBadge } from "@/components/shared/appointment-display/AppointmentTypeGlassBadge";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import { EntityDetailRecordAuditCard } from "@/components/shared/entity-detail/EntityDetailRecordAuditCard";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { buildInvoiceDetailAuditExtraRows } from "@/lib/appointment-detail-invoice-audit-rows";
import { mapInvoiceRecordAuditActors } from "@/lib/entity-detail-audit-actor";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";
import {
  getInvoiceAppointmentTitle,
  resolveInvoiceDetailHeaderTitle,
} from "@/lib/invoice-list-row-display";
import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDurationMinutes,
  resolveAppointmentTypeDisplayName,
} from "@/lib/appointment-type-display";
import {
  entityDetailInvoiceRecordSectionTitle,
  entityDetailOwnedSnapshotSectionTitle,
} from "@/lib/entity-detail-snapshot-section-copy";
import { EntityDetailPageShell } from "@/components/shared/entity-detail/EntityDetailPageShell";
import { pageChromeTitleClass } from "@/lib/page-chrome-classes";
import { entityDetailPageHeaderClass } from "@/lib/patient-detail-ui-classes";
import {
  invoiceDetailAuditIconCircleClass,
  invoiceDetailCardBorderClass,
  invoiceDetailCardFrameClass,
  invoiceDetailChromeIconClass,
  invoiceDetailChromeIconTileClass,
  invoiceDetailDefinitionListClass,
  invoiceDetailDefinitionRowClass,
  invoiceDetailFieldIconCircleClass,
  invoiceDetailFieldIconClass,
  invoiceDetailSectionIconCircleClass,
  invoiceDetailSectionIconClass,
  invoiceDetailSnapshotSectionClass,
} from "@/lib/invoice-detail-ui-classes";
import { clinicalCellMutedTextClass } from "@/lib/table-display-styles";
import { formatShortEntityId } from "@/lib/entity-id-display";
import { cn } from "@/lib/utils";

type Props = {
  initialInvoice: Invoice;
  uiAccess: InvoiceDetailUiAccess;
  viewerRole: EntityRole;
  variant: "control-panel" | "portal";
  backHref: string;
  backLabel?: string;
  initialInvoicesList?: Invoice[] | null;
};

function InvoiceDetailDefinitionRow({
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
          <Icon className={invoiceDetailFieldIconClass} />
        </span>
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-gray-700">{children}</dd>
    </div>
  );
}

/**
 * Live invoice detail — glass definition list + linked visit + payments (useInvoice cache).
 */
export function InvoiceDetailLiveBody({
  initialInvoice,
  uiAccess,
  viewerRole,
  variant,
  backHref,
  backLabel,
  initialInvoicesList,
}: Props) {
  const { data: invoice = initialInvoice } = useInvoice(initialInvoice.id, {
    initialData: initialInvoice,
  });

  const displayTitle = resolveInvoiceDetailHeaderTitle(invoice);
  const visitTitle = getInvoiceAppointmentTitle(invoice);
  const invoiceRecordSectionTitle = entityDetailInvoiceRecordSectionTitle(displayTitle);
  const baseSubtitle =
    invoice.visit_summary?.patient_label && invoice.visit_summary?.when_label
      ? `${invoice.visit_summary.patient_label} · ${invoice.visit_summary.when_label}`
      : invoice.description ?? "Billing record";

  const appointmentHref = invoice.appointment_id
    ? variant === "control-panel"
      ? `/control-panel/appointments/${invoice.appointment_id}`
      : appointmentDetailHref(viewerRole, invoice.appointment_id)
    : null;

  const patientHref =
    invoice.visit_summary?.patient_id && viewerRole === "admin"
      ? patientDetailHref("admin", invoice.visit_summary.patient_id)
      : invoice.visit_summary?.patient_id
        ? patientDetailHref(viewerRole, invoice.visit_summary.patient_id)
        : null;

  const linkPolicy =
    variant === "portal" ? resolvePortalAppointmentDetailLinkPolicy(viewerRole) : undefined;

  const paymentHistoryTitle = entityDetailOwnedSnapshotSectionTitle(
    invoice.visit_summary?.patient_label,
    "paymentHistory",
    "patient"
  );

  const { createdBy, updatedBy } = useMemo(
    () => mapInvoiceRecordAuditActors(invoice),
    [invoice]
  );

  const auditExtraRows = useMemo(
    () => buildInvoiceDetailAuditExtraRows(invoice, viewerRole),
    [invoice, viewerRole]
  );

  const visitTypeName = invoice.visit_summary
    ? resolveAppointmentTypeDisplayName(invoice.visit_summary)
    : null;
  const visitDurationLabel = invoice.visit_summary
    ? formatAppointmentTypeDurationLabel(
      resolveAppointmentTypeDurationMinutes(invoice.visit_summary)
    )
    : null;

  return (
    <EntityDetailPageShell
      shell={variant === "control-panel" ? "control-panel" : "portal"}
      header={
        <EntityDetailChromeHeader
          className={entityDetailPageHeaderClass}
          icon={Receipt}
          iconTileClassName={invoiceDetailChromeIconTileClass}
          iconClassName={invoiceDetailChromeIconClass}
          title={
            <span className="flex flex-wrap items-center gap-2">
              <span className={cn(pageChromeTitleClass, "min-w-0 break-words")}>{displayTitle}</span>
              <InvoiceStatusBadge invoice={invoice} />
            </span>
          }
          description={
            <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5">
              {baseSubtitle}
              <span aria-hidden> · </span>
              <EntityIdCopyInline
                value={invoice.id}
                displayValue={formatShortEntityId(invoice.id)}
                textClassName="text-sm text-muted-foreground font-mono"
              />
            </span>
          }
          actions={
            <InvoiceDetailHeaderActions
              initialInvoice={invoice}
              accessLevel={uiAccess}
              backHref={backHref}
              invoicesInitialData={initialInvoicesList ?? undefined}
            />
          }
        />
      }
    >

      <Card className={cn(invoiceDetailCardFrameClass, invoiceDetailCardBorderClass)}>
        <CardContent className="space-y-3 p-4 sm:p-5">
          <EntityDetailSnapshotSectionHeading
            icon={Receipt}
            sectionIconCircleClass={invoiceDetailSectionIconCircleClass}
            iconClassName={invoiceDetailSectionIconClass}
          >
            {invoiceRecordSectionTitle}
          </EntityDetailSnapshotSectionHeading>
          <dl className={invoiceDetailDefinitionListClass}>
            <InvoiceDetailDefinitionRow icon={Fingerprint} label="Invoice ID">
              <EntityIdCopyInline value={invoice.id} />
            </InvoiceDetailDefinitionRow>
            <InvoiceDetailDefinitionRow icon={Euro} label="Amount">
              <InvoiceAmountDisplay amountCents={invoice.amount} currency={invoice.currency} invoice={invoice} />
            </InvoiceDetailDefinitionRow>
            <InvoiceDetailDefinitionRow icon={Receipt} label="Status">
              <InvoiceStatusBadge invoice={invoice} />
            </InvoiceDetailDefinitionRow>
            {visitTypeName ? (
              <InvoiceDetailDefinitionRow icon={Stethoscope} label="Visit type">
                <AppointmentTypeGlassBadge
                  name={visitTypeName}
                  durationLabel={visitDurationLabel}
                />
              </InvoiceDetailDefinitionRow>
            ) : null}
            <InvoiceDetailDefinitionRow icon={FileText} label="Description">
              {invoice.description?.trim() ? (
                <span>{invoice.description}</span>
              ) : (
                <span className={clinicalCellMutedTextClass}>—</span>
              )}
            </InvoiceDetailDefinitionRow>
          </dl>
          <EntityDetailRecordAuditCard
            createdAt={invoice.created_at}
            updatedAt={invoice.updated_at ?? null}
            createdBy={createdBy}
            updatedBy={updatedBy}
            viewerRole={viewerRole}
            extraRows={auditExtraRows}
            iconCircleClass={invoiceDetailAuditIconCircleClass}
            iconClassName={invoiceDetailFieldIconClass}
          />
        </CardContent>
      </Card>

      {invoice.visit_summary ? (
        <InvoiceLinkedVisitPanel
          summary={invoice.visit_summary}
          appointmentHref={appointmentHref}
          patientHref={patientHref}
          viewerRole={viewerRole}
          visitTitle={visitTitle}
          linkPolicy={linkPolicy}
        />
      ) : null}

      <div className={invoiceDetailSnapshotSectionClass}>
        <EntityDetailSnapshotSectionHeading
          icon={CreditCard}
          sectionIconCircleClass={invoiceDetailSectionIconCircleClass}
          iconClassName={invoiceDetailSectionIconClass}
          count={invoice.payments.length}
        >
          {paymentHistoryTitle}
        </EntityDetailSnapshotSectionHeading>
        <InvoicePaymentHistoryTable
          payments={invoice.payments}
          currency={invoice.currency}
        />
      </div>

      <InvoiceDetailActionBar
        initialInvoice={invoice}
        accessLevel={uiAccess}
        backHref={backHref}
        backLabel={backLabel}
        invoicesInitialData={initialInvoicesList ?? undefined}
      />
    </EntityDetailPageShell>
  );
}
