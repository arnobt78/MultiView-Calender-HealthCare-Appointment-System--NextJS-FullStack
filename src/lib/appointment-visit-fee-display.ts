/**
 * Display helpers for visit fees on cards, booking, and invoice dialog hints.
 */

import {
  DEFAULT_DOCTOR_VISIT_FEE_CENTS,
  resolveVisitFeeCents,
  type VisitFeeInput,
} from "@/lib/billing-visit-fee";

export { DEFAULT_DOCTOR_VISIT_FEE_CENTS };
export type { VisitFeeInput };

/** Cents to show on appointment surfaces (type → doctor → €150 default). */
export function resolveDisplayedVisitFeeCents(input: VisitFeeInput): number {
  return resolveVisitFeeCents(input);
}

/** EUR label for prose / detail rows (includes € prefix — do not pair with Euro icon). */
export function formatVisitFeeEurLabel(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/** Patient booking steps 2–3 — type price when set, else doctor/default with · est. */
export function resolveBookingVisitFeeDisplay(input: {
  selectedType: { price_cents?: number } | null;
  doctorConsultationFeeCents?: number | null;
  isFlexible: boolean;
}): { cents: number; showEstimateHint: boolean } | null {
  const { selectedType, doctorConsultationFeeCents, isFlexible } = input;
  if (!isFlexible && !selectedType) return null;

  const typePrice =
    !isFlexible && selectedType ? (selectedType.price_cents ?? 0) : 0;
  if (typePrice > 0) {
    return { cents: typePrice, showEstimateHint: false };
  }

  const cents = resolveDisplayedVisitFeeCents({
    typePriceCents: 0,
    doctorConsultationFeeCents,
  });
  if (cents <= 0) return null;
  return { cents, showEstimateHint: true };
}

export type VisitFeeHintSource = "type" | "doctor" | "default";

/** Explains which fee source applies — for invoice dialog helper text. */
export function describeVisitFeeSource(input: VisitFeeInput): {
  cents: number;
  source: VisitFeeHintSource;
} {
  const typePrice = input.typePriceCents ?? 0;
  if (typePrice > 0) {
    return { cents: typePrice, source: "type" };
  }
  const doctorFee = input.doctorConsultationFeeCents ?? 0;
  if (doctorFee > 0) {
    return { cents: doctorFee, source: "doctor" };
  }
  return { cents: DEFAULT_DOCTOR_VISIT_FEE_CENTS, source: "default" };
}

/** User-facing hint under amount field on create invoice. */
export function buildInvoiceAmountFeeHint(input: VisitFeeInput): string {
  const { source } = describeVisitFeeSource(input);
  if (source === "type") {
    return "Suggested from visit type fee — you can override.";
  }
  if (source === "doctor") {
    return "Suggested from treating doctor consultation fee — you can override.";
  }
  return `No visit type fee on file — default doctor visit (${formatVisitFeeEurLabel(DEFAULT_DOCTOR_VISIT_FEE_CENTS)}) prefilled. You can override.`;
}

/** Booking wizard note — includes default fallback when types lack price_cents. */
export function bookingVisitFeeInfoNote(): string {
  return `Visit fee is reserved at booking. An invoice is generated automatically once the appointment is marked as completed. When a visit type has no fee, the default doctor visit (${formatVisitFeeEurLabel(DEFAULT_DOCTOR_VISIT_FEE_CENTS)}) applies unless you enter another amount on the invoice.`;
}
