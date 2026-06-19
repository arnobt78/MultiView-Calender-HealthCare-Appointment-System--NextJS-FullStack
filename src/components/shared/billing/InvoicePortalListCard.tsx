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
import {
  invoicePortalCardVisitToneClass,
  linkedAppointmentStatusFromInvoice,
} from "@/lib/visit-billing-action-gates";
import { cn } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  viewerRole: EntityRole;
  /** 1-based index in visible portal list — `Invoice N: #shortId` header. */
  listIndex?: number;
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
  listIndex,
  shellClassName,
  headerStripClassName,
  headerActions,
  className,
}: Props) {
  const appointmentStatus = linkedAppointmentStatusFromInvoice(invoice);
  const visitToneClass = invoicePortalCardVisitToneClass(appointmentStatus);

  return (
    // overflow-hidden — header strip bg must not square off parent rounded-xl corners
    <div
      className={cn(
        shellClassName,
        "w-full min-w-0 overflow-hidden",
        visitToneClass,
        className
      )}
    >
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
            listIndex={listIndex}
            showInvoiceLeadingIcon
            compact
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

      <div className="flex w-full min-w-0 flex-col gap-1 px-4 py-2">
        <InvoiceDescriptionTableCell
          invoice={invoice}
          viewerRole={viewerRole}
          density="portal"
        />
        <InvoicePortalListMetaRow invoice={invoice} viewerRole={viewerRole} />
      </div>
    </div>
  );
}
