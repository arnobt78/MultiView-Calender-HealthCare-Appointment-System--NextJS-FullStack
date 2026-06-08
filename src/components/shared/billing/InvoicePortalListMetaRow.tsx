"use client";

import { format } from "date-fns";
import { InvoiceIssuedByMeta } from "@/components/shared/billing/InvoiceIssuedByMeta";
import { InvoiceDueTableCell } from "@/components/shared/billing/invoice-table-cells";
import type { Invoice } from "@/hooks/usePayments";
import { invoiceDueDateTextClassForStatus } from "@/lib/invoice-status-display";
import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import { clinicalCellMutedTextClass } from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  className?: string;
};

/** Doctor portal invoice list footer — Due / Created / Issued on one responsive wrap row. */
export function InvoicePortalListMetaRow({ invoice, className }: Props) {
  const displayStatus = resolveInvoiceDisplayStatus(invoice);

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs",
        className
      )}
    >
      <span className="inline-flex min-w-0 items-center gap-1">
        <span className="shrink-0 font-medium text-slate-600">Due:</span>
        <InvoiceDueTableCell invoice={invoice} />
      </span>
      <span className="inline-flex min-w-0 items-center gap-1">
        <span className="shrink-0 font-medium text-slate-600">Created:</span>
        <span
          className={cn(
            "tabular-nums",
            invoice.due_date
              ? clinicalCellMutedTextClass
              : invoiceDueDateTextClassForStatus(displayStatus)
          )}
        >
          {format(new Date(invoice.created_at), "dd MMM yyyy")}
        </span>
      </span>
      <InvoiceIssuedByMeta
        createdAt={invoice.created_at}
        issuerLabel={invoice.issuer_label}
        issuerImage={invoice.issuer_image}
        issuerEmail={invoice.issuer_email}
        className="min-w-0 shrink"
      />
    </div>
  );
}
