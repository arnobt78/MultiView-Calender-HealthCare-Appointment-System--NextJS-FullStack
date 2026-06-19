"use client";

import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { InvoiceVisitTitleRow } from "@/components/shared/billing/InvoiceVisitTitleRow";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceVisitMetaLine } from "@/components/shared/billing/InvoiceVisitMetaLine";
import { InvoicePayActions } from "@/components/shared/billing/InvoicePayActions";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { invoiceTreatingDoctorFromSummary } from "@/lib/invoice-visit-doctor";
import { InvoiceIssuedByMeta } from "@/components/shared/billing/InvoiceIssuedByMeta";
import { invoiceIssuedByMetaProps } from "@/lib/invoice-issued-by-display";
import type { Invoice } from "@/hooks/usePayments";
import { getInvoiceListTitle } from "@/lib/invoice-list-display";
import { invoiceDetailHref } from "@/lib/entity-routes";
import { invoiceVisitSummaryToMetaInput } from "@/lib/invoice-visit-meta-line";
import { invoiceDueDateTextClassForInvoice } from "@/lib/invoice-status-display";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  onPay: () => void;
  isPaying?: boolean;
};

/**
 * Patient portal sidebar invoice row — structured rows (no duplicate summary line dump).
 */
export function PatientPortalInvoiceCard({ invoice, onPay, isPaying }: Props) {
  const summary = invoice.visit_summary;
  const title = getInvoiceListTitle(invoice);
  const href = invoiceDetailHref("patient", invoice.id);

  const dueOrCreatedLabel = invoice.due_date
    ? { prefix: "Due", value: format(new Date(invoice.due_date), "dd MMM yyyy") }
    : {
        prefix: "Issued",
        value: format(new Date(invoice.created_at), "dd MMM yyyy"),
      };

  const treatingDoctor = invoiceTreatingDoctorFromSummary(summary);

  return (
    <article
      className={cn(
        "rounded-xl border border-sky-200/55 bg-white/90 px-3 py-2.5",
        "shadow-[0_8px_24px_rgba(14,165,233,0.12)]"
      )}
    >
      <div className="min-w-0 space-y-2">
        <InvoiceVisitTitleRow
          href={href}
          title={title}
          invoice={invoice}
          wrapLabel
          linkClassName="text-sm font-medium"
          className="w-full"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            className={cn(
              "flex min-w-0 items-center gap-1.5 text-[11px]",
              invoice.due_date
                ? invoiceDueDateTextClassForInvoice(invoice)
                : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            <span>
              <span className="font-medium text-gray-600">{dueOrCreatedLabel.prefix} </span>
              <span className="tabular-nums">{dueOrCreatedLabel.value}</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <InvoiceAmountDisplay
              amountCents={invoice.amount}
              currency={invoice.currency}
              invoice={invoice}
            />
            <InvoiceStatusBadge invoice={invoice} />
          </div>
        </div>

        {summary ? (
          <InvoiceVisitMetaLine
            source={invoiceVisitSummaryToMetaInput(summary)}
            variant="icons"
            className="text-[11px]"
          />
        ) : null}

        <div className="space-y-1.5">
          {treatingDoctor ? (
            <DoctorIdentityRow
              doctor={treatingDoctor}
              linkKind="role"
              viewerRole="patient"
              size="sm"
              showEmail
              showSpecialty
              showRoleBadge
              staffRole={summary?.treating_physician_role ?? null}
              layout="compactStack"
            />
          ) : null}
          <InvoiceIssuedByMeta
            {...invoiceIssuedByMetaProps(invoice, "patient")}
            layout="wrapInline"
          />
        </div>

        <div className="flex justify-end pt-0.5">
          <InvoicePayActions
            status={invoice.status}
            onPay={onPay}
            isPaying={isPaying}
            glass
          />
        </div>
      </div>
    </article>
  );
}
