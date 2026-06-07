"use client";

import {
  Banknote,
  FileEdit,
  FileWarning,
  Mail,
  RotateCcw,
  XCircle,
} from "lucide-react";
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
  /** Lucide icon beside label (default true). */
  showIcon?: boolean;
};

function InvoiceStatusIcon({
  resolved,
  className,
}: {
  resolved: string;
  className?: string;
}) {
  switch (resolved) {
    case "sent":
      return <Mail className={className} aria-hidden />;
    case "paid":
      return <Banknote className={className} aria-hidden />;
    case "overdue":
      return <FileWarning className={className} aria-hidden />;
    case "cancelled":
      return <XCircle className={className} aria-hidden />;
    case "refunded":
      return <RotateCcw className={className} aria-hidden />;
    case "draft":
    default:
      return <FileEdit className={className} aria-hidden />;
  }
}

export function InvoiceStatusBadge({
  status,
  invoice,
  displayStatus,
  className,
  showIcon = true,
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
        "calendar-glass-badge inline-flex items-center gap-1 text-[10px] py-0 capitalize",
        STATUS_CLASS[resolved] ?? "calendar-glass-badge-slate",
        className
      )}
    >
      {showIcon ? <InvoiceStatusIcon resolved={resolved} className="h-3 w-3 shrink-0" /> : null}
      {label}
    </Badge>
  );
}
