"use client";

import { CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/lib/billing-types";
import {
  paymentStatusGlassClass,
  resolvePaymentDisplayLabel,
} from "@/lib/payment-status-display";
import { cn } from "@/lib/utils";

type Props = {
  status: PaymentStatus | string;
  className?: string;
  /** Show lucide icon beside label (default true). */
  showIcon?: boolean;
};

function PaymentStatusIcon({
  status,
  className,
}: {
  status: PaymentStatus | string;
  className?: string;
}) {
  const key = (status ?? "pending").toLowerCase();
  switch (key) {
    case "succeeded":
      return <CheckCircle2 className={className} aria-hidden />;
    case "failed":
      return <XCircle className={className} aria-hidden />;
    case "refunded":
      return <RotateCcw className={className} aria-hidden />;
    case "pending":
    default:
      return <Clock className={className} aria-hidden />;
  }
}

/** Glass badge for payment history rows — pending / paid / failed / refunded. */
export function PaymentStatusBadge({ status, className, showIcon = true }: Props) {
  const label = resolvePaymentDisplayLabel(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        "calendar-glass-badge inline-flex items-center gap-1 text-[10px] py-0 font-normal",
        paymentStatusGlassClass(status),
        className
      )}
    >
      {showIcon ? <PaymentStatusIcon status={status} className="h-3 w-3 shrink-0" /> : null}
      {label}
    </Badge>
  );
}
