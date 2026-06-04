"use client";

import { InvoiceAdminActionsMenu } from "@/components/shared/billing/InvoiceAdminActionsMenu";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import {
  InvoiceCreatedTableCell,
  InvoiceDescriptionTableCell,
  InvoiceDueTableCell,
  InvoiceNumberTableCell,
} from "@/components/shared/billing/invoice-table-cells";
import type { Invoice } from "@/hooks/usePayments";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (invoice: Invoice) => void;
  isUpdating?: boolean;
};

export const doctorPortalInvoiceListRowClass =
  "border-b border-border/40 py-2 last:border-0";

/** Doctor portal billing list — reuses CP `invoice-table-cells` for parity (stacked layout). */
export function DoctorPortalInvoiceListRow({
  invoice,
  onSend,
  onDelete,
  onEdit,
  isUpdating,
}: Props) {
  const viewerRole = "doctor" as const;

  return (
    <li className={doctorPortalInvoiceListRowClass}>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 shrink">
            <InvoiceNumberTableCell invoice={invoice} viewerRole={viewerRole} />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <InvoiceAmountDisplay
              amountCents={invoice.amount}
              currency={invoice.currency}
              invoice={invoice}
              className="text-sm font-normal tabular-nums"
            />
            <InvoiceStatusBadge invoice={invoice} />
            <InvoiceAdminActionsMenu
              invoice={invoice}
              viewerRole={viewerRole}
              onEdit={onEdit}
              onSend={onSend}
              onDelete={onDelete}
              isUpdating={isUpdating}
            />
          </div>
        </div>

        <InvoiceDescriptionTableCell invoice={invoice} viewerRole={viewerRole} />

        <div
          className={cn(
            "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
          )}
        >
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-gray-500">Due:</span>
            <InvoiceDueTableCell invoice={invoice} />
          </span>
          <span className="inline-flex min-w-0 flex-col gap-0.5">
            <span className="font-medium text-gray-500">Created:</span>
            <InvoiceCreatedTableCell invoice={invoice} />
          </span>
        </div>
      </div>
    </li>
  );
}
