/**
 * Invoice detail body — shared by CP admin route and portal `/invoices/[id]` (doctor/patient).
 */

import Link from "next/link";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Receipt, CreditCard } from "lucide-react";
import { InvoiceDetailClient } from "@/components/shared/billing/InvoiceDetailClient";
import { InvoiceDetailQuerySeed } from "@/components/shared/billing/InvoiceDetailQuerySeed";
import { InvoicePaymentHistoryTable } from "@/components/shared/billing/InvoicePaymentHistoryTable";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceLinkedVisitPanel } from "@/components/shared/billing/InvoiceLinkedVisitPanel";
import { appointmentDetailHref } from "@/lib/entity-routes";
import type { InvoiceDetailUiAccess } from "@/lib/invoice-detail-ssr";
import type { Invoice } from "@/hooks/usePayments";
import type { EntityRole } from "@/lib/entity-routes";

type Props = {
  clientInvoice: Invoice;
  uiAccess: InvoiceDetailUiAccess;
  backHref: string;
  viewerRole: EntityRole;
  /** CP uses control-panel appointment link; portal uses role-aware href. */
  variant: "control-panel" | "portal";
};

export function InvoiceDetailScreen({
  clientInvoice,
  uiAccess,
  backHref,
  viewerRole,
  variant,
}: Props) {
  const invoice = clientInvoice;
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
    <div className="space-y-2">
      <InvoiceDetailQuerySeed invoice={clientInvoice} />
      <PageHeader
        title={`Invoice #${invoice.id.slice(0, 8)}`}
        description={invoice.description ?? "No description"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <InvoiceDetailClient invoice={clientInvoice} accessLevel={uiAccess} />
            <Button variant="outline" asChild>
              <BackNavigationLink href={backHref}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </BackNavigationLink>
            </Button>
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
    </div>
  );
}
