"use client";

import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { InvoiceVisitTitleRow } from "@/components/shared/billing/InvoiceVisitTitleRow";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceVisitSummaryLine } from "@/components/shared/billing/InvoiceVisitSummaryLine";
import { InvoiceIssuedByMeta } from "@/components/shared/billing/InvoiceIssuedByMeta";
import { invoiceIssuedByMetaProps } from "@/lib/invoice-issued-by-display";
import { getInvoiceListTitle } from "@/lib/invoice-list-display";
import { invoiceTreatingDoctorFromSummary } from "@/lib/invoice-visit-doctor";
import { invoiceDetailHref } from "@/lib/entity-routes";
import { invoiceDueDateTextClassForInvoice } from "@/lib/invoice-status-display";
import {
  clinicalCellMutedTextClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";
import type { InvoiceRow } from "@/lib/billing-types";

/** Glass list row shell — org billing + compact invoice previews. */
export const invoiceBillingListRowShellClass =
  "rounded-xl border border-sky-200/50 bg-white/80 px-3 py-2.5 shadow-[0_10px_28px_rgba(14,165,233,0.08)] backdrop-blur-sm transition-colors hover:border-sky-300/60 hover:bg-sky-50/30";

type Props = {
  invoice: InvoiceRow;
  viewerRole?: "admin" | "doctor" | "patient";
  className?: string;
};

export function InvoiceBillingListRow({
  invoice,
  viewerRole = "admin",
  className,
}: Props) {
  const summary = invoice.visit_summary;
  const href = invoiceDetailHref(viewerRole, invoice.id);
  const title = getInvoiceListTitle(invoice);
  const treatingDoctor = invoiceTreatingDoctorFromSummary(summary);

  return (
    <li className={cn(invoiceBillingListRowShellClass, className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <InvoiceVisitTitleRow
            href={href}
            title={title}
            invoice={invoice}
            wrapLabel
            linkClassName="text-sm font-semibold"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div
              className={cn(
                "inline-flex items-center gap-1 text-[11px]",
                invoice.due_date
                  ? invoiceDueDateTextClassForInvoice(invoice)
                  : clinicalCellMutedTextClass
              )}
            >
              <CalendarClock className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
              {invoice.due_date ? (
                <span>
                  Due {format(new Date(invoice.due_date), "dd MMM yyyy")}
                </span>
              ) : (
                <span>Issued {format(new Date(invoice.created_at), "dd MMM yyyy")}</span>
              )}
            </div>
          </div>
          <InvoiceVisitSummaryLine summary={summary} className="text-xs" />
          {treatingDoctor ? (
            <DoctorIdentityRow
              doctor={treatingDoctor}
              linkKind={viewerRole === "patient" ? "none" : "admin-cp"}
              size="sm"
              layout="inline"
              showEmail={false}
              showSpecialty
            />
          ) : null}
          <InvoiceIssuedByMeta {...invoiceIssuedByMetaProps(invoice, viewerRole)} />
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:flex-col sm:items-end">
          <InvoiceAmountDisplay
            amountCents={invoice.amount}
            currency={invoice.currency}
            invoice={invoice}
          />
          <InvoiceStatusBadge invoice={invoice} />
        </div>
      </div>
    </li>
  );
}
