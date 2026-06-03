"use client";

import { useInvoice } from "@/hooks/useInvoice";
import type { Invoice } from "@/hooks/usePayments";
import type { EntityRole } from "@/lib/entity-routes";
import { appointmentDetailHref } from "@/lib/entity-routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InvoiceDetailClient } from "@/components/shared/billing/InvoiceDetailClient";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceLinkedVisitPanel } from "@/components/shared/billing/InvoiceLinkedVisitPanel";
import { InvoicePaymentHistoryTable } from "@/components/shared/billing/InvoicePaymentHistoryTable";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";

type Props = {
  initialInvoice: Invoice;
  uiAccess: InvoiceDetailUiAccess;
  viewerRole: EntityRole;
  variant: "control-panel" | "portal";
  headerActions?: React.ReactNode;
};

/**
 * Live invoice detail body — useInvoice keeps amount/description/status in sync after PATCH
 * without navigation (invalidates queryKeys.invoices.detail).
 */
export function InvoiceDetailLiveBody({
  initialInvoice,
  uiAccess,
  viewerRole,
  variant,
  headerActions,
}: Props) {
  const { data: invoice = initialInvoice } = useInvoice(initialInvoice.id, {
    initialData: initialInvoice,
  });

  const amountFormatted = (invoice.amount / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: invoice.currency.toUpperCase(),
  });

  const appointmentHref = invoice.appointment_id
    ? variant === "control-panel"
      ? `/control-panel/appointments/${invoice.appointment_id}`
      : appointmentDetailHref(viewerRole, invoice.appointment_id)
    : null;

  return (
    <>
      <PageHeader
        title={`Invoice #${invoice.id.slice(0, 8)}`}
        description={invoice.description ?? "No description"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <InvoiceDetailClient
              invoice={invoice}
              accessLevel={uiAccess}
              hideViewLink
            />
            {headerActions}
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">id</dt>
              <dd className="font-mono break-all text-xs">{invoice.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">amount</dt>
              <dd className="font-semibold text-lg">{amountFormatted}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">status</dt>
              <dd>
                <InvoiceStatusBadge invoice={invoice} />
              </dd>
            </div>
            {invoice.due_date && (
              <div>
                <dt className="font-medium text-muted-foreground">due</dt>
                <dd>{new Date(invoice.due_date).toLocaleDateString("de-DE")}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {invoice.visit_summary && (
        <InvoiceLinkedVisitPanel
          summary={invoice.visit_summary}
          appointmentHref={appointmentHref}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History ({invoice.payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvoicePaymentHistoryTable
            payments={invoice.payments}
            currency={invoice.currency}
          />
        </CardContent>
      </Card>
    </>
  );
}
