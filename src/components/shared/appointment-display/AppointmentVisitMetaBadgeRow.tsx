"use client";

import { Euro } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { PaymentStatusBadge } from "@/components/shared/billing/PaymentStatusBadge";
import { formatVisitFeeAmountLabel } from "@/lib/appointment-type-price";
import {
  appointmentVisitMetaBadgeRowClass,
  appointmentVisitMetaBillingChipSkeletonClass,
  appointmentVisitMetaChipClass,
  appointmentVisitMetaFeeChipClass,
  appointmentVisitMetaTypeChipClass,
} from "@/lib/appointment-visit-meta-badge-ui";
import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import { telehealthQueueHeaderChipClass } from "@/lib/telehealth-queue-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  appointmentTypeName?: string | null;
  durationMinutes?: number | null;
  visitFeeCents?: number;
  /** Doctor/default fee fallback — shows · est. suffix when true. */
  showVisitFeeEstimateHint?: boolean;
  status?: string | null;
  /** When true, renders compact telehealth session chip (queue/detail). */
  showTelehealthBadge?: boolean;
  /** Invoice display status from warm `invoices.all` cache. */
  invoiceDisplayStatus?: InvoiceDisplayStatus | null;
  showInvoiceBadge?: boolean;
  /** Latest payment row status — paired with invoice dedupe rules. */
  paymentStatus?: string | null;
  showPaymentBadge?: boolean;
  /** True only when invoices.all is loading and SSR/cache has no seed — targeted chip skeleton. */
  billingBadgesLoading?: boolean;
  className?: string;
};

/** Shared h-6 chip class for status, invoice, and payment siblings. */
const metaChipClass = cn(telehealthQueueHeaderChipClass, appointmentVisitMetaChipClass);

/**
 * Visit Overview meta chips — type + duration, fee, status, telehealth, invoice/payment.
 * Reused on appointment detail (below heading) and telehealth queue surfaces.
 */
export function AppointmentVisitMetaBadgeRow({
  appointmentTypeName,
  durationMinutes,
  visitFeeCents = 0,
  showVisitFeeEstimateHint = false,
  status,
  showTelehealthBadge = false,
  invoiceDisplayStatus,
  showInvoiceBadge = false,
  paymentStatus,
  showPaymentBadge = false,
  billingBadgesLoading = false,
  className,
}: Props) {
  const typeName = appointmentTypeName?.trim();
  const durationLabel =
    durationMinutes != null && durationMinutes > 0 ? `${durationMinutes} min` : null;

  return (
    <div className={cn(appointmentVisitMetaBadgeRowClass, className)}>
      {typeName ? (
        <span className={appointmentVisitMetaTypeChipClass}>
          <span className="truncate">{typeName}</span>
          {durationLabel ? (
            <span className="shrink-0 text-violet-600/90">· {durationLabel}</span>
          ) : null}
        </span>
      ) : durationLabel ? (
        <span className={appointmentVisitMetaTypeChipClass}>{durationLabel}</span>
      ) : null}
      {visitFeeCents > 0 ? (
        <span className={appointmentVisitMetaFeeChipClass}>
          <Euro className="size-3 shrink-0" aria-hidden />
          {formatVisitFeeAmountLabel(visitFeeCents)}
          {showVisitFeeEstimateHint ? (
            <span className="text-[9px] font-normal text-emerald-500/90">· est.</span>
          ) : null}
        </span>
      ) : null}
      {status ? (
        <AppointmentStatusGlassBadge
          status={status}
          size="compact"
          className={metaChipClass}
        />
      ) : null}
      {billingBadgesLoading ? (
        <Skeleton
          className={appointmentVisitMetaBillingChipSkeletonClass}
          aria-label="Loading billing status"
        />
      ) : (
        <>
          {showInvoiceBadge && invoiceDisplayStatus ? (
            <InvoiceStatusBadge
              displayStatus={invoiceDisplayStatus}
              className={metaChipClass}
            />
          ) : null}
          {showPaymentBadge && paymentStatus ? (
            <PaymentStatusBadge status={paymentStatus} className={metaChipClass} />
          ) : null}
        </>
      )}
      {showTelehealthBadge ? (
        <TelehealthSessionBadge className={metaChipClass} />
      ) : null}
    </div>
  );
}
