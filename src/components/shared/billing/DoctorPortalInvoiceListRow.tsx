"use client";

import { InvoiceAdminActionsMenu } from "@/components/shared/billing/InvoiceAdminActionsMenu";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoicePortalListMetaRow } from "@/components/shared/billing/InvoicePortalListMetaRow";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import {
  InvoiceDescriptionTableCell,
  InvoiceNumberTableCell,
} from "@/components/shared/billing/invoice-table-cells";
import type { Invoice } from "@/hooks/usePayments";
import {
  doctorPortalInvoiceHeaderStripClass,
  doctorPortalInvoiceListItemShellClass,
} from "@/lib/doctor-portal-layout";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (invoice: Invoice) => void;
  isUpdating?: boolean;
};

/** Doctor portal billing list — bordered card, sky header band, visit body + meta footer. */
export function DoctorPortalInvoiceListRow({
  invoice,
  onSend,
  onDelete,
  onEdit,
  isUpdating,
}: Props) {
  const viewerRole = "doctor" as const;

  return (
    <li className="w-full min-w-0">
      <div className={cn(doctorPortalInvoiceListItemShellClass, "w-full min-w-0")}>
        <div
          className={cn(
            doctorPortalInvoiceHeaderStripClass,
            "flex w-full min-w-0 flex-wrap items-center justify-between gap-2"
          )}
        >
          <div className="flex min-w-0 shrink items-center">
            <InvoiceNumberTableCell
              invoice={invoice}
              viewerRole={viewerRole}
              idLabelPrefix="Invoice"
              showInvoiceLeadingIcon
            />
          </div>
          <div className="inline-flex shrink-0 flex-nowrap items-center gap-1.5">
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

        <div className="flex w-full min-w-0 flex-col gap-2 px-2.5 pt-2 pb-2.5">
          <InvoiceDescriptionTableCell invoice={invoice} viewerRole={viewerRole} />
          <InvoicePortalListMetaRow invoice={invoice} viewerRole={viewerRole} />
        </div>
      </div>
    </li>
  );
}
