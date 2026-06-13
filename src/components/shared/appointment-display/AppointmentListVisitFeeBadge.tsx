"use client";

import { VisitFeeBadge } from "@/components/shared/billing/VisitFeeBadge";
import { resolveDisplayedVisitFeeCents } from "@/lib/appointment-visit-fee-display";
import type { VisitFeeBadgeSize } from "@/lib/visit-fee-badge-ui-classes";

type AppointmentListVisitFeeBadgeProps = {
  appointmentTypePriceCents?: number | null;
  doctorConsultationFeeCents?: number | null;
  /** `cardMeta` for portal/calendar rows; `table` for CP list status column glass parity. */
  size?: VisitFeeBadgeSize;
};

/**
 * Portal/admin/doctor list rows — type price → doctor fee → default (€150).
 * Pairs with `VisitFeeBadge` `cardMeta` (same height as timeline category row).
 */
export function AppointmentListVisitFeeBadge({
  appointmentTypePriceCents,
  doctorConsultationFeeCents,
  size = "cardMeta",
}: AppointmentListVisitFeeBadgeProps) {
  const cents = resolveDisplayedVisitFeeCents({
    typePriceCents: appointmentTypePriceCents,
    doctorConsultationFeeCents,
  });
  if (cents <= 0) return null;

  const showEstimateHint = (appointmentTypePriceCents ?? 0) <= 0;

  return (
    <VisitFeeBadge
      size={size}
      priceCents={cents}
      showEstimateHint={showEstimateHint}
    />
  );
}
