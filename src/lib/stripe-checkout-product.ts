/**
 * Stripe Checkout `product_data` name + description — human visit context (not raw invoice.description).
 * Description uses `\n` line breaks (one fact per line) for the hosted Checkout left panel.
 */

import type { InvoiceRow, InvoiceVisitSummary } from "@/lib/billing-types";
import { getInvoiceListTitle } from "@/lib/invoice-list-display";
import { mapInvoiceIssuedByActor } from "@/lib/invoice-issued-by-display";
import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDurationMinutes,
} from "@/lib/appointment-type-display";

const STRIPE_NAME_MAX = 120;
const STRIPE_DESC_MAX = 500;

export type StripeCheckoutProductCopy = {
  name: string;
  description: string;
};

function clip(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Visit type + when on one line — matches Stripe panel headline. */
function stripeHeadlineLine(summary: InvoiceVisitSummary): string | null {
  const typeName = summary.appointment_type_name?.trim();
  const when = summary.when_label?.trim();
  if (typeName && when) return `${typeName} ${when}`;
  if (when) return when;
  return typeName ?? null;
}

/** Clinic / telehealth + category label (no date/time). */
function stripePlaceLine(summary: InvoiceVisitSummary): string | null {
  if (summary.is_telehealth) return "Video call (telehealth)";
  const loc = summary.location_label?.trim();
  const cleanLoc =
    loc && loc !== "—" && !/telehealth|video call/i.test(loc) ? loc : null;
  const cat = summary.category_label?.trim() || null;
  if (cleanLoc && cat) return `${cleanLoc} — ${cat}`;
  return cleanLoc || cat;
}

/**
 * Multi-line Stripe Checkout description — visit type, place, patient, physician, duration, issuer.
 * Exported for tests; `buildStripeCheckoutProductCopy` is the payments entry point.
 */
export function formatStripeCheckoutVisitDescription(
  summary: InvoiceVisitSummary,
  opts?: { issuer_label?: string | null }
): string {
  const lines: string[] = [];

  const headline = stripeHeadlineLine(summary);
  if (headline) lines.push(headline);

  const place = stripePlaceLine(summary);
  if (place) lines.push(place);

  const typeName = summary.appointment_type_name?.trim();
  if (typeName && headline && !headline.startsWith(typeName)) {
    lines.push(`Visit type: ${typeName}`);
  }

  const durationLabel = formatAppointmentTypeDurationLabel(
    resolveAppointmentTypeDurationMinutes({
      duration_minutes: summary.duration_minutes,
      appointment_type_duration_minutes: summary.appointment_type_duration_minutes,
    })
  );
  if (durationLabel) lines.push(`Duration: ${durationLabel}`);

  if (summary.patient_label?.trim()) {
    lines.push(`Patient: ${summary.patient_label.trim()}`);
  }

  if (summary.treating_physician_label?.trim()) {
    const spec = summary.treating_physician_specialty?.trim();
    lines.push(
      `Treating physician: ${summary.treating_physician_label.trim()}${spec ? ` · ${spec}` : ""}`
    );
  }

  const issuer = opts?.issuer_label?.trim();
  if (issuer) lines.push(`Issued by: ${issuer}`);

  if (summary.is_telehealth && !lines.some((l) => /telehealth/i.test(l))) {
    lines.push("Telehealth visit");
  }

  return lines.join("\n");
}

/** Build Stripe line-item label + multi-line description from invoice + visit_summary. */
export function buildStripeCheckoutProductCopy(
  invoice: Pick<InvoiceRow, "id" | "visit_summary" | "issuer_label"> & {
    description?: string | null;
  }
): StripeCheckoutProductCopy {
  const name = clip(
    getInvoiceListTitle({
      id: invoice.id,
      description: invoice.description ?? undefined,
      visit_summary: invoice.visit_summary,
    }),
    STRIPE_NAME_MAX
  );
  const summary = invoice.visit_summary;
  if (!summary) {
    const fallback = invoice.description?.trim() || name;
    return { name, description: clip(fallback, STRIPE_DESC_MAX) };
  }

  const desc = formatStripeCheckoutVisitDescription(summary, {
    issuer_label:
      mapInvoiceIssuedByActor(invoice)?.label ?? invoice.issuer_label ?? undefined,
  });
  const body = desc.trim() || clip(summary.title || name, STRIPE_DESC_MAX);
  return { name, description: clip(body, STRIPE_DESC_MAX) };
}
