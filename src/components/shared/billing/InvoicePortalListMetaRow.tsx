"use client";

import { format } from "date-fns";
import { InvoiceIssuedByMeta } from "@/components/shared/billing/InvoiceIssuedByMeta";
import { invoiceIssuedByMetaProps } from "@/lib/invoice-issued-by-display";
import { InvoiceDeletionActorMeta } from "@/components/shared/billing/InvoiceDeletionActorMeta";
import { InvoiceDueTableCell } from "@/components/shared/billing/invoice-table-cells";
import type { Invoice } from "@/hooks/usePayments";
import {
  listInvoiceDeletionMetaSlices,
} from "@/lib/entity-detail-audit-actor";
import {
  invoiceDueDateTextClassForStatus,
  invoiceDetachedVisitMetaTextClass,
  invoiceDueDateTextClassForDetachedVisit,
  invoiceStatusInlineTextClass,
  isInvoiceTombstone,
} from "@/lib/invoice-status-display";
import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import { resolveInvoiceListMetaStatusDates } from "@/lib/invoice-list-meta-status-dates";
import { clinicalCellMutedTextClass } from "@/lib/table-display-styles";
import type { EntityRole } from "@/lib/entity-routes";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  viewerRole?: EntityRole;
  className?: string;
};

/** Doctor portal invoice list footer — Due / Created / Paid|Refunded / Issued on one wrap row. */
export function InvoicePortalListMetaRow({
  invoice,
  viewerRole = "doctor",
  className,
}: Props) {
  const displayStatus = resolveInvoiceDisplayStatus(invoice);
  const statusDates = resolveInvoiceListMetaStatusDates(invoice);
  const tombstone = isInvoiceTombstone(invoice);
  const deletionSlices = listInvoiceDeletionMetaSlices(invoice);
  const detachedLabelClass = invoiceDetachedVisitMetaTextClass();
  const detachedValueClass = invoiceDueDateTextClassForDetachedVisit();

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs",
        className
      )}
    >
      {deletionSlices.map((slice) => (
        <InvoiceDeletionActorMeta
          key={slice.kind}
          kind={slice.kind}
          at={slice.at}
          actor={slice.actor}
          viewerRole={viewerRole}
        />
      ))}
      <span className="inline-flex min-w-0 items-center gap-1">
        <span className="shrink-0 font-medium text-slate-600">Due:</span>
        {tombstone ? (
          <span className={cn("text-xs tabular-nums", detachedValueClass)}>
            {invoice.due_date
              ? format(new Date(invoice.due_date), "dd MMM yyyy")
              : "—"}
          </span>
        ) : (
          <InvoiceDueTableCell invoice={invoice} />
        )}
      </span>
      <span className="inline-flex min-w-0 items-center gap-1">
        <span className="shrink-0 font-medium text-slate-600">Created:</span>
        <span
          className={cn(
            "tabular-nums",
            tombstone
              ? detachedValueClass
              : invoice.due_date
                ? clinicalCellMutedTextClass
                : invoiceDueDateTextClassForStatus(displayStatus)
          )}
        >
          {format(new Date(invoice.created_at), "dd MMM yyyy")}
        </span>
      </span>
      {statusDates.map((segment) => (
        <span key={segment.label} className="inline-flex min-w-0 items-center gap-1">
          <span
            className={cn(
              "shrink-0 font-medium",
              tombstone
                ? detachedLabelClass
                : invoiceStatusInlineTextClass(segment.label.toLowerCase())
            )}
          >
            {segment.label}:
          </span>
          <span
            className={cn(
              "tabular-nums",
              tombstone
                ? detachedValueClass
                : invoiceStatusInlineTextClass(segment.label.toLowerCase())
            )}
          >
            {format(new Date(segment.iso), "dd MMM yyyy")}
          </span>
        </span>
      ))}
      <InvoiceIssuedByMeta
        {...invoiceIssuedByMetaProps(invoice, viewerRole)}
        issuedTextTone="sky"
        layout="wrapInline"
      />
    </div>
  );
}
