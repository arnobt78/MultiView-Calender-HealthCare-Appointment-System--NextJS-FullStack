"use client";

import { InvoiceVisitDescriptionStack } from "@/components/shared/billing/InvoiceVisitDescriptionStack";
import { InvoiceIssuedByMeta } from "@/components/shared/billing/InvoiceIssuedByMeta";
import type { Invoice } from "@/hooks/usePayments";
import { invoiceDueDateTextClassForStatus } from "@/lib/invoice-status-display";
import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import {
  clinicalCellMutedTextClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { EntityRole } from "@/lib/entity-routes";
import { invoiceDetailHref } from "@/lib/entity-routes";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { formatShortEntityId } from "@/lib/entity-id-display";

type InvoiceTableCellsProps = {
  invoice: Invoice;
  viewerRole: EntityRole;
};

/** Sky link + clipboard — short invoice id in list tables. */
export function InvoiceNumberTableCell({ invoice, viewerRole }: InvoiceTableCellsProps) {
  const href = invoiceDetailHref(viewerRole, invoice.id);
  return (
    <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
      <EntityIdCopyInline
        value={invoice.id}
        labelNode={
          <EntityTitleLink
            href={href}
            label={formatShortEntityId(invoice.id)}
            className="font-mono text-xs font-normal"
          />
        }
        monospace={false}
      />
    </div>
  );
}

/** Stacked visit context — title, type badge, when, patient, doctors, category. */
export function InvoiceDescriptionTableCell({ invoice, viewerRole }: InvoiceTableCellsProps) {
  return <InvoiceVisitDescriptionStack invoice={invoice} viewerRole={viewerRole} />;
}

export function InvoiceDueTableCell({ invoice }: { invoice: Invoice }) {
  const displayStatus = resolveInvoiceDisplayStatus(invoice);
  if (!invoice.due_date) {
    return (
      <span className={cn(clinicalCellMutedTextClass, "text-xs")}>—</span>
    );
  }
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        invoiceDueDateTextClassForStatus(displayStatus)
      )}
    >
      {format(new Date(invoice.due_date), "dd MMM yyyy")}
    </span>
  );
}

export function InvoiceCreatedTableCell({ invoice }: { invoice: Invoice }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 py-0.5">
      <span className={cn(clinicalCellMutedTextClass, "text-xs tabular-nums")}>
        {format(new Date(invoice.created_at), "dd MMM yyyy")}
      </span>
      <InvoiceIssuedByMeta
        createdAt={invoice.created_at}
        issuerLabel={invoice.issuer_label}
        issuerImage={invoice.issuer_image}
      />
    </div>
  );
}
