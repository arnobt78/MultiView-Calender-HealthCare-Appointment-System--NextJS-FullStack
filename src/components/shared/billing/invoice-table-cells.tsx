"use client";

import { Receipt } from "lucide-react";
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
import { formatPortalInvoiceListLabel } from "@/lib/invoice-list-display";

type InvoiceTableCellsProps = {
  invoice: Invoice;
  viewerRole: EntityRole;
};

type InvoiceNumberTableCellProps = InvoiceTableCellsProps & {
  /** e.g. "Invoice" → `Invoice #168da90a` (doctor portal list). */
  idLabelPrefix?: string;
  /** 1-based position in visible portal list → `Invoice 1: #168da90a`. */
  listIndex?: number;
  /** Doctor portal header — Receipt icon before label (invoice detail parity). */
  showInvoiceLeadingIcon?: boolean;
  /** Portal list header — skip table min-row height. */
  compact?: boolean;
};

/** Sky link + clipboard — short invoice id in list tables. */
export function InvoiceNumberTableCell({
  invoice,
  viewerRole,
  idLabelPrefix,
  listIndex,
  showInvoiceLeadingIcon = false,
  compact = false,
}: InvoiceNumberTableCellProps) {
  const href = invoiceDetailHref(viewerRole, invoice.id);
  const shortId = formatShortEntityId(invoice.id);
  const displayLabel =
    listIndex != null && idLabelPrefix?.trim()
      ? formatPortalInvoiceListLabel(listIndex, invoice.id)
      : idLabelPrefix?.trim()
        ? `${idLabelPrefix.trim()} ${shortId}`
        : shortId;
  return (
    <div
      className={cn(
        compact ? "min-h-0" : clinicalTableCellMinRowClass,
        "flex items-center gap-1.5"
      )}
    >
      {showInvoiceLeadingIcon ? (
        <Receipt className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
      ) : null}
      <EntityIdCopyInline
        value={invoice.id}
        labelNode={
          <EntityTitleLink
            href={href}
            label={displayLabel}
            className="font-mono text-xs font-normal"
          />
        }
        monospace={false}
      />
    </div>
  );
}

type InvoiceDescriptionTableCellProps = InvoiceTableCellsProps & {
  /** Portal billing cards — tighter vertical rhythm (tables keep default). */
  density?: "table" | "portal";
};

/** Stacked visit context — title, type badge, when, patient, doctors, category. */
export function InvoiceDescriptionTableCell({
  invoice,
  viewerRole,
  density = "table",
}: InvoiceDescriptionTableCellProps) {
  return (
    <InvoiceVisitDescriptionStack
      invoice={invoice}
      viewerRole={viewerRole}
      density={density}
    />
  );
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
