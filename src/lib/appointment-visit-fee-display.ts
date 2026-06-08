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

/** Read-only linked-visit strip — resolved fee + source (dialog summary card). */
export function buildInvoiceVisitFeeStripLine(input: VisitFeeInput): string {
  const { cents, source } = describeVisitFeeSource(input);
  const label = formatVisitFeeEurLabel(cents);
  if (source === "type") {
    return `Visit type fee ${label} — ${buildInvoiceAmountFeeHint(input)}`;
  }
  if (source === "doctor") {
    return `Consultation fee ${label} — ${buildInvoiceAmountFeeHint(input)}`;
  }
  return `Default visit fee ${label} — ${buildInvoiceAmountFeeHint(input)}`;
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

/** Context for booking / dialog visit-fee disclaimer copy. */
export type BookingVisitFeeNoteInput = {
  doctorConsultationFeeCents?: number | null;
  /** Selected visit type price — when &gt; 0, type fee applies (no doctor/default mention). */
  selectedTypePriceCents?: number | null;
  isFlexible?: boolean;
};

const BOOKING_FEE_NOTE_LEAD =
  "Visit fee is reserved at booking. An invoice is generated automatically once the appointment is marked as completed.";

/**
 * Dynamic booking disclaimer — mirrors `resolveVisitFeeCents` (type → doctor → default).
 * When type has a price, omits misleading €150-only wording.
 */
export function buildBookingVisitFeeInfoNote(
  input: BookingVisitFeeNoteInput = {}
): string {
  const typePrice = input.selectedTypePriceCents ?? 0;
  if (typePrice > 0) {
    return `${BOOKING_FEE_NOTE_LEAD} This visit type includes a listed fee (${formatVisitFeeEurLabel(typePrice)}). Staff can adjust the invoice amount before sending if needed.`;
  }

  const { source, cents } = describeVisitFeeSource({
    typePriceCents: 0,
    doctorConsultationFeeCents: input.doctorConsultationFeeCents,
  });

  if (source === "doctor") {
    return `${BOOKING_FEE_NOTE_LEAD} When a visit type has no fee, this doctor's consultation fee (${formatVisitFeeEurLabel(cents)} · est.) applies unless you enter another amount on the invoice.`;
  }

  return `${BOOKING_FEE_NOTE_LEAD} When a visit type has no fee and no doctor consultation fee is on file, the clinic default (${formatVisitFeeEurLabel(DEFAULT_DOCTOR_VISIT_FEE_CENTS)}) applies unless you enter another amount on the invoice.`;
}

/** /services — explains tiered fees before a doctor is chosen in the wizard. */
export function buildServicesVisitFeePolicyNote(): string {
  return `Each service shows its visit fee when listed. If a service has no price, your doctor's consultation fee applies (amounts vary by specialist). If neither is set, the clinic default (${formatVisitFeeEurLabel(DEFAULT_DOCTOR_VISIT_FEE_CENTS)}) is used. Invoices are created automatically when the visit is marked completed; staff can adjust the amount before sending.`;
}

/** @deprecated Prefer `buildBookingVisitFeeInfoNote` with doctor/type context. */
export function bookingVisitFeeInfoNote(): string {
  return buildBookingVisitFeeInfoNote();
}
