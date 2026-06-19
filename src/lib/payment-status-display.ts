/**
 * Payment row status — glass badges, amount tint, and Stripe reference labels (invoice detail table).
 */

import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";
import type { PaymentStatus } from "@/lib/billing-types";

export type PaymentDisplayStatus = PaymentStatus | string;

const PAYMENT_STATUS_GLASS: Record<string, string> = {
  pending: "calendar-glass-badge-amber",
  succeeded: "calendar-glass-badge-emerald",
  failed: "calendar-glass-badge-rose",
  refunded: "calendar-glass-badge-violet",
};

const PAYMENT_STATUS_TEXT: Record<string, string> = {
  pending: "text-amber-800",
  succeeded: "text-emerald-700",
  failed: "text-rose-700",
  refunded: "text-violet-700",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  succeeded: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const PAYMENT_STATUS_ICON: Record<string, LucideIcon> = {
  pending: Clock,
  succeeded: CheckCircle2,
  failed: XCircle,
  refunded: RotateCcw,
};

function normalizePaymentStatus(status: PaymentDisplayStatus | null | undefined): string {
  return (status ?? "pending").toLowerCase();
}

/** Patient-friendly label — maps Stripe `succeeded` to Paid. */
export function resolvePaymentDisplayLabel(status: PaymentDisplayStatus | null | undefined): string {
  const key = normalizePaymentStatus(status);
  return PAYMENT_STATUS_LABEL[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function paymentStatusGlassClass(status: PaymentDisplayStatus | null | undefined): string {
  const key = normalizePaymentStatus(status);
  return PAYMENT_STATUS_GLASS[key] ?? "calendar-glass-badge-slate";
}

export function paymentAmountTextClassForStatus(
  status: PaymentDisplayStatus | null | undefined
): string {
  const key = normalizePaymentStatus(status);
  return PAYMENT_STATUS_TEXT[key] ?? PAYMENT_STATUS_TEXT.pending;
}

export function resolvePaymentStatusIcon(
  status: PaymentDisplayStatus | null | undefined
): LucideIcon {
  const key = normalizePaymentStatus(status);
  return PAYMENT_STATUS_ICON[key] ?? Clock;
}

/** Seeded demo PaymentIntent ids — no live Stripe object; local refund only. */
export function isDemoCuratedStripePaymentId(
  stripePaymentId: string | null | undefined
): boolean {
  const trimmed = stripePaymentId?.trim();
  return Boolean(trimmed && /^pi_demo_curated_/i.test(trimmed));
}

/** Human-readable payment reference — demo seeds vs live Stripe IDs. */
export function formatPaymentReferenceLabel(stripePaymentId: string | null | undefined): {
  label: string;
  title: string | undefined;
} {
  const trimmed = stripePaymentId?.trim();
  if (!trimmed) {
    return { label: "—", title: undefined };
  }

  if (/^pi_demo_curated_/i.test(trimmed)) {
    if (/(_ref_|refund)/i.test(trimmed)) {
      return { label: "Demo card payment · Refunded", title: trimmed };
    }
    if (/(_paid_|paid)/i.test(trimmed)) {
      return { label: "Demo card payment · Paid", title: trimmed };
    }
    return { label: "Demo card payment", title: trimmed };
  }

  if (trimmed.startsWith("pi_") && trimmed.length > 8) {
    return { label: `Stripe ····${trimmed.slice(-4)}`, title: trimmed };
  }

  return { label: trimmed, title: trimmed };
}
