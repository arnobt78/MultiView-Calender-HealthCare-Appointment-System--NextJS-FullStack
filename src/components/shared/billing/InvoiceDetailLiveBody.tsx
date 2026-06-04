"use client";

import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  CreditCard,
  Euro,
  FileText,
  Fingerprint,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { useInvoice } from "@/hooks/useInvoice";
import type { Invoice } from "@/hooks/usePayments";
import type { EntityRole } from "@/lib/entity-routes";
import {
  appointmentDetailHref,
  invoiceDetailHref,
  patientDetailHref,
} from "@/lib/entity-routes";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { InvoiceDetailClient } from "@/components/shared/billing/InvoiceDetailClient";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceLinkedVisitPanel } from "@/components/shared/billing/InvoiceLinkedVisitPanel";
import { InvoicePaymentHistoryTable } from "@/components/shared/billing/InvoicePaymentHistoryTable";
import { InvoiceIssuedByMeta } from "@/components/shared/billing/InvoiceIssuedByMeta";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import { EntityDetailRecordAuditCard } from "@/components/shared/entity-detail/EntityDetailRecordAuditCard";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";
import { getInvoiceAppointmentTitle } from "@/lib/invoice-list-row-display";
import { invoiceDueDateTextClassForStatus } from "@/lib/invoice-status-display";
import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import {
  invoiceDetailAuditIconCircleClass,
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
  headerActions?: React.ReactNode;
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
  headerActions,
  initialInvoicesList,
}: Props) {
  const { data: invoice = initialInvoice } = useInvoice(initialInvoice.id, {
    initialData: initialInvoice,
  });

  const displayStatus = resolveInvoiceDisplayStatus(invoice);
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

  return (
    <div className="space-y-3 text-gray-700">
      <PageHeader
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
          <div className="flex flex-wrap items-center gap-2">
            <InvoiceDetailClient
              invoice={invoice}
              accessLevel={uiAccess}
              hideViewLink
              invoicesInitialData={initialInvoicesList ?? undefined}
            />
            {headerActions}
          </div>
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
            {invoice.due_date ? (
              <InvoiceDetailDefinitionRow icon={Calendar} label="Due date">
                <span
                  className={cn(
                    "tabular-nums",
                    invoiceDueDateTextClassForStatus(displayStatus)
                  )}
                >
                  {format(new Date(invoice.due_date), "PPP")}
                </span>
              </InvoiceDetailDefinitionRow>
            ) : null}
            <InvoiceDetailDefinitionRow icon={FileText} label="Description">
              {invoice.description?.trim() ? (
                <span>{invoice.description}</span>
              ) : (
                <span className={clinicalCellMutedTextClass}>—</span>
              )}
            </InvoiceDetailDefinitionRow>
            <InvoiceDetailDefinitionRow icon={Calendar} label="Created">
              <div className="space-y-1">
                <span className={cn(clinicalCellMutedTextClass, "text-xs tabular-nums")}>
                  {format(new Date(invoice.created_at), "PPP · p")}
                </span>
                <InvoiceIssuedByMeta
                  createdAt={invoice.created_at}
                  issuerLabel={invoice.issuer_label}
                  issuerImage={invoice.issuer_image}
                />
              </div>
            </InvoiceDetailDefinitionRow>
            {invoice.paid_at ? (
              <InvoiceDetailDefinitionRow icon={CreditCard} label="Paid at">
                <span className="tabular-nums text-emerald-700">
                  {format(new Date(invoice.paid_at), "PPP · p")}
                </span>
              </InvoiceDetailDefinitionRow>
            ) : null}
          </dl>
          <EntityDetailRecordAuditCard
            createdAt={invoice.created_at}
            createdBy={
              invoice.issuer_label
                ? { userId: invoice.user_id, label: invoice.issuer_label }
                : null
            }
            viewerRole={viewerRole}
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
        />
      ) : null}

      <div className={invoiceDetailSnapshotSectionClass}>
        <EntityDetailSnapshotSectionHeading
          icon={CreditCard}
          sectionIconCircleClass={invoiceDetailSectionIconCircleClass}
          iconClassName="h-3.5 w-3.5 text-amber-600"
          count={invoice.payments.length}
        >
          Payment history
        </EntityDetailSnapshotSectionHeading>
        <Card className={cn(invoiceDetailCardFrameClass, "border-amber-100/50 shadow-none")}>
          <CardContent className="p-3 sm:p-4">
            <InvoicePaymentHistoryTable
              payments={invoice.payments}
              currency={invoice.currency}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
