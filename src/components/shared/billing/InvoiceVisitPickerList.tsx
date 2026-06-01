"use client";

import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import { invoiceDetailHref } from "@/lib/entity-routes";
import type { EntityRole } from "@/lib/entity-routes";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";

type Props = {
  options: InvoiceAppointmentOptionRow[];
  value: string;
  onSelect: (appointmentId: string) => void;
  viewerRole: EntityRole;
  disabled?: boolean;
};

/** Compact visit rows for invoice create — patient, date, amount, billing badge. */
export function InvoiceVisitPickerList({
  options,
  value,
  onSelect,
  viewerRole,
  disabled = false,
}: Props) {
  if (options.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
        No billable visits match. Try search or enable &quot;Show billed visits&quot; (admin).
      </p>
    );
  }

  return (
    <ul className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border bg-muted/20 p-1.5">
      {options.map((opt) => {
        const selected = value === opt.id;
        const rowDisabled = disabled || !opt.eligible;

        return (
          <li key={opt.id}>
            <button
              type="button"
              disabled={rowDisabled}
              onClick={() => {
                if (!rowDisabled) onSelect(opt.id);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors",
                selected && opt.eligible
                  ? "border-sky-400/40 bg-sky-50/80 ring-1 ring-sky-400/30"
                  : "border-transparent bg-card hover:bg-muted/50",
                rowDisabled && "cursor-not-allowed opacity-60"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-800">{opt.patient_label}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {format(new Date(opt.start), "dd MMM yyyy")}
                  {opt.title ? ` · ${opt.title}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                {opt.amount_cents != null && opt.currency && (
                  <InvoiceAmountDisplay
                    amountCents={opt.amount_cents}
                    currency={opt.currency}
                    className="text-[10px] font-semibold"
                  />
                )}
                {opt.display_status && (
                  <InvoiceStatusBadge displayStatus={opt.display_status} />
                )}
              </div>
            </button>
            {!opt.eligible && opt.invoice_id && (
              <p className="mt-0.5 px-1 text-[10px] text-muted-foreground">
                {opt.block_reason}{" "}
                <Link
                  href={invoiceDetailHref(viewerRole, opt.invoice_id)}
                  className="text-sky-700 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View invoice
                </Link>
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
