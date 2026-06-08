"use client";

import {
  DOCTOR_PORTAL_INVOICE_STATUS_INLINE_ORDER,
  type DoctorPortalInvoiceStatusCounts,
} from "@/lib/doctor-portal-billing-display";
import { invoiceStatusInlineTextClass } from "@/lib/invoice-status-display";
import { cn } from "@/lib/utils";

type Props = {
  counts: DoctorPortalInvoiceStatusCounts;
  className?: string;
};

/** Doctor portal billing header — colored Draft/Sent/Paid/… segments with · separators (no outline badge). */
export function InvoiceStatusCountInlineRow({ counts, className }: Props) {
  return (
    <span
      className={cn("inline-flex min-w-0 flex-wrap items-center gap-x-1 text-xs", className)}
      aria-label={DOCTOR_PORTAL_INVOICE_STATUS_INLINE_ORDER.map((key) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return `${label}: ${counts[key]}`;
      }).join(", ")}
    >
      {DOCTOR_PORTAL_INVOICE_STATUS_INLINE_ORDER.map((key, index) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return (
          <span key={key} className="inline-flex items-center gap-x-1">
            {index > 0 ? (
              <span className="text-muted-foreground/70" aria-hidden>
                ·
              </span>
            ) : null}
            <span className={cn("font-medium tabular-nums", invoiceStatusInlineTextClass(key))}>
              {label}: {counts[key]}
            </span>
          </span>
        );
      })}
    </span>
  );
}
