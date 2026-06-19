"use client";

import { Receipt } from "lucide-react";
import { InvoiceVisitDescriptionStack } from "@/components/shared/billing/InvoiceVisitDescriptionStack";
import { InvoiceIssuedByMeta } from "@/components/shared/billing/InvoiceIssuedByMeta";
import { invoiceIssuedByMetaProps } from "@/lib/invoice-issued-by-display";
import { InvoiceDeletionActorMeta } from "@/components/shared/billing/InvoiceDeletionActorMeta";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import type { Invoice } from "@/hooks/usePayments";
import { invoiceDueDateTextClassForInvoice, isInvoiceTombstone, invoiceDueDateTextClassForDetachedVisit } from "@/lib/invoice-status-display";
import { listInvoiceDeletionMetaSlices } from "@/lib/entity-detail-audit-actor";
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
import {
  formatInvoiceManagementSequenceLabel,
  formatPortalInvoiceListLabel,
} from "@/lib/invoice-list-display";

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
  const tombstone = isInvoiceTombstone(invoice);
  if (!invoice.due_date) {
    return (
      <span
        className={cn(
          clinicalCellMutedTextClass,
          "text-xs",
          tombstone ? invoiceDueDateTextClassForDetachedVisit() : null
        )}
      >
        —
      </span>
    );
  }
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        tombstone
          ? invoiceDueDateTextClassForDetachedVisit()
          : invoiceDueDateTextClassForInvoice(invoice)
      )}
    >
      {format(new Date(invoice.due_date), "dd MMM yyyy")}
    </span>
  );
}

type InvoiceCreatedTableCellProps = {
  invoice: Invoice;
  viewerRole?: EntityRole;
};

/** CP invoice table — amount on top, status badge below. */
function InvoiceAmountStatusStack({ invoice }: { invoice: Invoice }) {
  return (
    <>
      <InvoiceAmountDisplay
        amountCents={invoice.amount}
        currency={invoice.currency}
        invoice={invoice}
      />
      <InvoiceStatusBadge invoice={invoice} />
    </>
  );
}

export function InvoiceAmountStatusTableCell({ invoice }: { invoice: Invoice }) {
  return (
    <div
      className={cn(
        clinicalTableCellMinRowClass,
        "flex flex-col items-start justify-center gap-1 py-0.5"
      )}
    >
      <InvoiceAmountStatusStack invoice={invoice} />
    </div>
  );
}

/**
 * CP invoice-management — merged Invoice column: inline identity + amount + badge.
 * Identity stays one line on desktop; copy icon sits inline after the id text.
 */
export function InvoiceManagementIdentityCell({
  invoice,
  viewerRole,
  listIndex,
}: InvoiceTableCellsProps & { listIndex: number }) {
  const href = invoiceDetailHref(viewerRole, invoice.id);
  const shortId = formatShortEntityId(invoice.id);
  const identityLabel = `${formatInvoiceManagementSequenceLabel(listIndex)}: ${shortId}`;

  return (
    <div
      className={cn(
        clinicalTableCellMinRowClass,
        "flex min-w-0 flex-col gap-1 py-0.5"
      )}
    >
      <EntityIdCopyInline
        value={invoice.id}
        className="inline-flex w-max max-w-full flex-nowrap items-center gap-0.5"
        labelNode={
          <EntityTitleLink
            href={href}
            label={identityLabel}
            className="font-mono text-sm font-normal"
          />
        }
        monospace={false}
      />
      <InvoiceAmountStatusStack invoice={invoice} />
    </div>
  );
}

export function InvoiceCreatedTableCell({
  invoice,
  viewerRole = "admin",
}: InvoiceCreatedTableCellProps) {
  const tombstone = isInvoiceTombstone(invoice);
  const deletionSlices = listInvoiceDeletionMetaSlices(invoice);
  return (
    <div className="flex min-w-0 flex-col gap-1 py-0.5">
      {deletionSlices.map((slice) => (
        <InvoiceDeletionActorMeta
          key={slice.kind}
          kind={slice.kind}
          at={slice.at}
          actor={slice.actor}
          viewerRole={viewerRole}
          layout="compact"
        />
      ))}
      <span
        className={cn(
          clinicalCellMutedTextClass,
          "text-xs tabular-nums",
          tombstone ? invoiceDueDateTextClassForDetachedVisit() : null
        )}
      >
        {format(new Date(invoice.created_at), "dd MMM yyyy")}
      </span>
      <InvoiceIssuedByMeta
        {...invoiceIssuedByMetaProps(invoice, viewerRole)}
        issuedTextTone="sky"
        compact
      />
    </div>
  );
}
