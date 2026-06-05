"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  CreditCard,
  Euro,
  FileText,
  Fingerprint,
  Receipt,
  Stethoscope,
} from "lucide-react";
import { useMemo } from "react";
import { useInvoice } from "@/hooks/useInvoice";
import type { Invoice } from "@/hooks/usePayments";
import type { EntityRole } from "@/lib/entity-routes";
import {
  appointmentDetailHref,
  invoiceDetailHref,
  patientDetailHref,
} from "@/lib/entity-routes";
import { Card, CardContent } from "@/components/ui/card";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { InvoiceDetailActionBar } from "@/components/shared/billing/InvoiceDetailActionBar";
import { resolvePortalEntityDetailSnapshotLinkPolicy } from "@/lib/entity-detail-snapshot-links";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceLinkedVisitPanel } from "@/components/shared/billing/InvoiceLinkedVisitPanel";
import { InvoicePaymentHistoryTable } from "@/components/shared/billing/InvoicePaymentHistoryTable";
import { AppointmentTypeGlassBadge } from "@/components/shared/appointment-display/AppointmentTypeGlassBadge";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import { EntityDetailRecordAuditCard } from "@/components/shared/entity-detail/EntityDetailRecordAuditCard";
import {
  buildInvoiceDetailAuditExtraRows,
  mapInvoiceIssuerActor,
} from "@/lib/appointment-detail-invoice-audit-rows";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";
import { getInvoiceAppointmentTitle } from "@/lib/invoice-list-row-display";
import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDurationMinutes,
  resolveAppointmentTypeDisplayName,
} from "@/lib/appointment-type-display";
import { entityDetailOwnedSnapshotSectionTitle } from "@/lib/entity-detail-snapshot-section-copy";
import { entityDetailPageHeaderClass } from "@/lib/patient-detail-ui-classes";
import {
  invoiceDetailAuditIconCircleClass,
  invoiceDetailBackButtonClass,
  invoiceDetailChromeIconClass,
  invoiceDetailChromeIconTileClass,
  invoiceDetailCardFrameClass,
  invoiceDetailDefinitionListClass,
  invoiceDetailDefinitionRowClass,
  invoiceDetailFieldIconCircleClass,
  invoiceDetailSectionIconCircleClass,
  invoiceDetailSnapshotSectionClass,
} from "@/lib/invoice-detail-ui-classes";
import { clinicalCellMutedTextClass } from "@/lib/table-display-styles";
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
          <Icon className="h-3 w-3 text-amber-600" />
        </span>
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-gray-800">{children}</dd>
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

  const visitTitle = getInvoiceAppointmentTitle(invoice);
  const subtitle =
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
    variant === "portal" ? resolvePortalEntityDetailSnapshotLinkPolicy(viewerRole) : undefined;

  const paymentHistoryTitle = entityDetailOwnedSnapshotSectionTitle(
    invoice.visit_summary?.patient_label,
    "paymentHistory",
    "patient"
  );

  const auditExtraRows = useMemo(
    () => buildInvoiceDetailAuditExtraRows(invoice),
    [invoice]
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
    <div className="space-y-3 text-gray-700">
      <EntityDetailChromeHeader
        className={entityDetailPageHeaderClass}
        icon={Receipt}
        iconTileClassName={invoiceDetailChromeIconTileClass}
        iconClassName={invoiceDetailChromeIconClass}
        title={
          <span className="flex flex-wrap items-center gap-2">
            <EntityTitleLink
              href={invoiceDetailHref(viewerRole, invoice.id)}
              label={`Invoice #${invoice.id.slice(0, 8)}`}
              className="text-xl font-semibold"
            />
            <InvoiceStatusBadge invoice={invoice} />
          </span>
        }
        description={subtitle}
        actions={
          <BackNavigationLink
            href={backHref}
            className={cn(invoiceDetailBackButtonClass, "no-underline")}
          >
            <ArrowLeft className="shrink-0" aria-hidden />
            Back
          </BackNavigationLink>
        }
      />

      <Card className={cn(invoiceDetailCardFrameClass, "border-amber-100/50 shadow-none")}>
        <CardContent className="space-y-3 p-4 sm:p-5">
          <EntityDetailSnapshotSectionHeading
            icon={Receipt}
            sectionIconCircleClass={invoiceDetailSectionIconCircleClass}
            iconClassName="h-3.5 w-3.5 text-amber-600"
          >
            Invoice
          </EntityDetailSnapshotSectionHeading>
          <dl className={invoiceDetailDefinitionListClass}>
            <InvoiceDetailDefinitionRow icon={Fingerprint} label="Invoice ID">
              <span className="font-mono text-xs break-all text-muted-foreground">
                {invoice.id}
              </span>
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
            updatedAt={null}
            createdBy={mapInvoiceIssuerActor(invoice)}
            viewerRole={viewerRole}
            extraRows={auditExtraRows}
            iconCircleClass={invoiceDetailAuditIconCircleClass}
            iconClassName="h-3 w-3 text-amber-600"
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
          iconClassName="h-3.5 w-3.5 text-amber-600"
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
    </div>
  );
}
