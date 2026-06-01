"use client";

import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceVisitSummaryLine } from "@/components/shared/billing/InvoiceVisitSummaryLine";
import { invoiceDetailHref } from "@/lib/entity-routes";
import {
  clinicalCellMutedTextClass,
  entityDetailLinkClass,
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
  const title =
    invoice.description?.trim() || `#${invoice.id.slice(0, 8)}`;

  const treatingDoctor =
    summary?.treating_physician_id && summary.treating_physician_label
      ? {
          id: summary.treating_physician_id,
          display_name: summary.treating_physician_label,
          email: null,
          specialty: summary.treating_physician_specialty,
        }
      : null;

  return (
    <li className={cn(invoiceBillingListRowShellClass, className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <PrefetchingLink
            href={href}
            className={cn(
              entityDetailLinkClass,
              "block truncate text-sm font-semibold no-underline"
            )}
          >
            {title}
          </PrefetchingLink>
          <InvoiceVisitSummaryLine summary={summary} className="text-xs" />
          {treatingDoctor ? (
            <DoctorIdentityRow
              doctor={treatingDoctor}
              linkKind="admin-cp"
              size="sm"
              layout="inline"
              showEmail={false}
              showSpecialty
            />
          ) : null}
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-3 gap-y-0.5",
              clinicalCellMutedTextClass
            )}
          >
            {invoice.due_date ? (
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-3 w-3 shrink-0" aria-hidden />
                Due {format(new Date(invoice.due_date), "dd MMM yyyy")}
              </span>
            ) : null}
            <span>Created {format(new Date(invoice.created_at), "dd MMM yyyy")}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:flex-col sm:items-end">
          <InvoiceAmountDisplay amountCents={invoice.amount} currency={invoice.currency} />
          <InvoiceStatusBadge invoice={invoice} />
        </div>
      </div>
    </li>
  );
}
