"use client";

import type { ReactNode } from "react";
import { Euro } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  appointmentVisitMetaHeroGlassChipClass,
  appointmentVisitMetaTypeChipClass,
  appointmentVisitMetaUpNextHeroLeftClass,
  appointmentVisitMetaUpNextHeroRowClass,
} from "@/lib/appointment-visit-meta-badge-ui";
import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import { telehealthQueueHeaderChipClass } from "@/lib/telehealth-queue-ui-classes";
import { cn } from "@/lib/utils";

export type AppointmentVisitMetaBadgeRowLayout = "default" | "upNextHero";

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
  /**
   * `upNextHero` — Up Next card only: leading slot + status · fee · billing left,
   * telehealth right; skips type/duration chips (duration lives in card footer).
   */
  layout?: AppointmentVisitMetaBadgeRowLayout;
  /** Clock chip — only with `layout="upNextHero"`. */
  leadingSlot?: ReactNode;
  className?: string;
};

/** Default layout — h-6 chip class for status, invoice, and payment siblings. */
const metaChipClass = cn(telehealthQueueHeaderChipClass, appointmentVisitMetaChipClass);

type ChipProps = Pick<
  Props,
  | "visitFeeCents"
  | "showVisitFeeEstimateHint"
  | "status"
  | "invoiceDisplayStatus"
  | "showInvoiceBadge"
  | "paymentStatus"
  | "showPaymentBadge"
  | "billingBadgesLoading"
> & { heroGlass?: boolean };

function VisitMetaFeeChip({
  visitFeeCents = 0,
  showVisitFeeEstimateHint = false,
  heroGlass = false,
}: Pick<ChipProps, "visitFeeCents" | "showVisitFeeEstimateHint" | "heroGlass">) {
  if (visitFeeCents <= 0) return null;

  if (heroGlass) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "calendar-glass-badge calendar-glass-badge-emerald inline-flex items-center font-normal",
          appointmentVisitMetaHeroGlassChipClass
        )}
      >
        <Euro className="shrink-0" aria-hidden />
        {formatVisitFeeAmountLabel(visitFeeCents)}
        {showVisitFeeEstimateHint ? (
          <span className="text-[9px] font-normal opacity-80">· est.</span>
        ) : null}
      </Badge>
    );
  }

  return (
    <span className={appointmentVisitMetaFeeChipClass}>
      <Euro className="size-3 shrink-0" aria-hidden />
      {formatVisitFeeAmountLabel(visitFeeCents)}
      {showVisitFeeEstimateHint ? (
        <span className="text-[9px] font-normal text-emerald-500/90">· est.</span>
      ) : null}
    </span>
  );
}

function VisitMetaStatusChip({
  status,
  heroGlass = false,
}: Pick<ChipProps, "status" | "heroGlass">) {
  if (!status) return null;
  return (
    <AppointmentStatusGlassBadge
      status={status}
      size="compact"
      className={heroGlass ? appointmentVisitMetaHeroGlassChipClass : metaChipClass}
    />
  );
}

function VisitMetaBillingChips({
  billingBadgesLoading = false,
  invoiceDisplayStatus,
  showInvoiceBadge = false,
  paymentStatus,
  showPaymentBadge = false,
  heroGlass = false,
}: Pick<
  ChipProps,
  | "billingBadgesLoading"
  | "invoiceDisplayStatus"
  | "showInvoiceBadge"
  | "paymentStatus"
  | "showPaymentBadge"
  | "heroGlass"
>) {
  const chipClass = heroGlass ? appointmentVisitMetaHeroGlassChipClass : metaChipClass;

  if (billingBadgesLoading) {
    return (
      <Skeleton
        className={appointmentVisitMetaBillingChipSkeletonClass}
        aria-label="Loading billing status"
      />
    );
  }
  return (
    <>
      {showInvoiceBadge && invoiceDisplayStatus ? (
        <InvoiceStatusBadge displayStatus={invoiceDisplayStatus} className={chipClass} />
      ) : null}
      {showPaymentBadge && paymentStatus ? (
        <PaymentStatusBadge status={paymentStatus} className={chipClass} />
      ) : null}
    </>
  );
}

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
  layout = "default",
  leadingSlot,
  className,
}: Props) {
  if (layout === "upNextHero") {
    return (
      <div className={cn(appointmentVisitMetaUpNextHeroRowClass, className)}>
        <div className={appointmentVisitMetaUpNextHeroLeftClass}>
          {leadingSlot}
          <VisitMetaStatusChip status={status} heroGlass />
          <VisitMetaFeeChip
            visitFeeCents={visitFeeCents}
            showVisitFeeEstimateHint={showVisitFeeEstimateHint}
            heroGlass
          />
          <VisitMetaBillingChips
            billingBadgesLoading={billingBadgesLoading}
            invoiceDisplayStatus={invoiceDisplayStatus}
            showInvoiceBadge={showInvoiceBadge}
            paymentStatus={paymentStatus}
            showPaymentBadge={showPaymentBadge}
            heroGlass
          />
        </div>
        {showTelehealthBadge ? (
          <div className="ml-auto shrink-0">
            <TelehealthSessionBadge glass />
          </div>
        ) : null}
      </div>
    );
  }

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
      <VisitMetaFeeChip
        visitFeeCents={visitFeeCents}
        showVisitFeeEstimateHint={showVisitFeeEstimateHint}
      />
      <VisitMetaStatusChip status={status} />
      <VisitMetaBillingChips
        billingBadgesLoading={billingBadgesLoading}
        invoiceDisplayStatus={invoiceDisplayStatus}
        showInvoiceBadge={showInvoiceBadge}
        paymentStatus={paymentStatus}
        showPaymentBadge={showPaymentBadge}
      />
      {showTelehealthBadge ? (
        <TelehealthSessionBadge className={metaChipClass} />
      ) : null}
    </div>
  );
}
