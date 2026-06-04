/**
 * Stripe Checkout `product_data` name + description — human visit context (not raw invoice.description).
 * Hosted Checkout left panel is plain text only; each Pay Now creates a new session with fresh copy.
 */

import { format } from "date-fns";
import type { InvoiceRow, InvoiceVisitSummary } from "@/lib/billing-types";
import { getInvoiceListTitle } from "@/lib/invoice-list-display";
import {
  formatInvoiceVisitMetaTextLine,
  invoiceVisitSummaryToMetaInput,
} from "@/lib/invoice-visit-meta-line";

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

/** Build Stripe line-item label + multi-line description from invoice + visit_summary. */
export function buildStripeCheckoutProductCopy(
  invoice: Pick<InvoiceRow, "id" | "visit_summary"> & {
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

  const lines: string[] = [];
  const typeName =
    summary.appointment_type_name?.trim() || summary.category_label?.trim();
  if (typeName) lines.push(typeName);

  const whenLine = formatInvoiceVisitMetaTextLine(invoiceVisitSummaryToMetaInput(summary));
  if (whenLine) lines.push(whenLine);

  if (summary.patient_label?.trim()) {
    lines.push(`Patient: ${summary.patient_label.trim()}`);
  }

  if (summary.treating_physician_label?.trim()) {
    const spec = summary.treating_physician_specialty?.trim();
    lines.push(
      `Treating physician: ${summary.treating_physician_label.trim()}${spec ? ` · ${spec}` : ""}`
    );
  }

  if (summary.is_telehealth) {
    lines.push("Telehealth visit");
  }

  const desc =
    lines.length > 0 ? lines.join("\n") : clip(summary.title || name, STRIPE_DESC_MAX);
  return { name, description: clip(desc, STRIPE_DESC_MAX) };
}
