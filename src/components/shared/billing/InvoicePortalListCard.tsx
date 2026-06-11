"use client";

import type { ReactNode } from "react";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoicePortalListMetaRow } from "@/components/shared/billing/InvoicePortalListMetaRow";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import {
  InvoiceDescriptionTableCell,
  InvoiceNumberTableCell,
} from "@/components/shared/billing/invoice-table-cells";
import type { Invoice } from "@/hooks/usePayments";
import type { EntityRole } from "@/lib/entity-routes";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  viewerRole: EntityRole;
  shellClassName: string;
  headerStripClassName: string;
  headerActions?: ReactNode;
  className?: string;
};

/**
 * Shared doctor-portal-style invoice card body — header strip + visit stack + meta footer.
 * Used by DoctorPortalInvoiceListRow and org billing panels (indigo shell variant).
 */
export function InvoicePortalListCard({
  invoice,
  viewerRole,
  shellClassName,
  headerStripClassName,
  headerActions,
  className,
}: Props) {
  return (
    <div className={cn(shellClassName, "w-full min-w-0", className)}>
      <div
        className={cn(
          headerStripClassName,
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
          {headerActions}
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-2 px-2.5 pt-2 pb-2.5">
        <InvoiceDescriptionTableCell invoice={invoice} viewerRole={viewerRole} />
        <InvoicePortalListMetaRow invoice={invoice} viewerRole={viewerRole} />
      </div>
    </div>
  );
}
