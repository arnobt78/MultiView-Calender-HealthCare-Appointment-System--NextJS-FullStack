"use client";

import { VisitFeeBadge } from "@/components/shared/billing/VisitFeeBadge";
import { resolveDisplayedVisitFeeCents } from "@/lib/appointment-visit-fee-display";

type AppointmentListVisitFeeBadgeProps = {
  appointmentTypePriceCents?: number | null;
  doctorConsultationFeeCents?: number | null;
};

/**
 * Portal/admin/doctor list rows — type price → doctor fee → default (€150).
 * Pairs with `VisitFeeBadge` `cardMeta` (same height as timeline category row).
 */
export function AppointmentListVisitFeeBadge({
  appointmentTypePriceCents,
  doctorConsultationFeeCents,
}: AppointmentListVisitFeeBadgeProps) {
  const cents = resolveDisplayedVisitFeeCents({
    typePriceCents: appointmentTypePriceCents,
    doctorConsultationFeeCents,
  });
  if (cents <= 0) return null;

  const showEstimateHint = (appointmentTypePriceCents ?? 0) <= 0;

  return (
    <VisitFeeBadge
      size="cardMeta"
      priceCents={cents}
      showEstimateHint={showEstimateHint}
    />
  );
}
