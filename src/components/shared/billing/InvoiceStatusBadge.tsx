"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  resolveInvoiceDisplayStatus,
  type InvoiceDisplayStatus,
  type InvoiceForDisplay,
} from "@/lib/billing-appointment-eligibility";

const STATUS_CLASS: Record<string, string> = {
  draft: "calendar-glass-badge-slate",
  sent: "calendar-glass-badge-sky",
  paid: "calendar-glass-badge-emerald",
  overdue: "calendar-glass-badge-rose",
  cancelled: "calendar-glass-badge-amber",
  refunded: "calendar-glass-badge-violet",
};

type Props = {
  /** Raw DB status — use `invoice` or `displayStatus` when refund label matters. */
  status?: string;
  invoice?: InvoiceForDisplay;
  displayStatus?: InvoiceDisplayStatus | string;
  className?: string;
};

export function InvoiceStatusBadge({
  status,
  invoice,
  displayStatus,
  className,
}: Props) {
  const resolved =
    displayStatus ??
    (invoice ? resolveInvoiceDisplayStatus(invoice) : (status ?? "draft"));

  const label =
    resolved === "refunded"
      ? "Refunded"
      : resolved.charAt(0).toUpperCase() + resolved.slice(1);

  return (
    <Badge
      variant="outline"
      className={cn(
        "calendar-glass-badge text-[10px] py-0 capitalize",
        STATUS_CLASS[resolved] ?? "calendar-glass-badge-slate",
        className
      )}
    >
      {label}
    </Badge>
  );
}
