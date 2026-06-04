/**
 * Shared visit when/location meta — invoice dialog summary card + directory picker tiles.
 * ISO `start_iso` / `end_iso` match API; `when_label` is preformatted fallback from billing load.
 */

import type { InvoiceAppointmentOptionRow, InvoiceVisitSummary } from "@/lib/billing-types";
import {
  formatInvoiceVisitDateLabel,
  formatInvoiceVisitTimeRange,
} from "@/lib/invoice-list-row-display";

function resolveVisitLocationLabel(input: InvoiceVisitMetaInput): string | null {
  if (input.is_telehealth) return null;
  const loc = input.location_label?.trim();
  if (!loc || loc === "—") return null;
  if (/telehealth|video call/i.test(loc)) return null;
  return loc;
}

export type InvoiceVisitMetaInput = {
  start_iso?: string | null;
  end_iso?: string | null;
  when_label?: string | null;
  location_label?: string | null;
  is_telehealth: boolean;
};

export function invoiceVisitSummaryToMetaInput(
  summary: InvoiceVisitSummary
): InvoiceVisitMetaInput {
  return {
    start_iso: summary.start_iso,
    end_iso: summary.end_iso,
    when_label: summary.when_label,
    location_label: summary.location_label,
    is_telehealth: summary.is_telehealth,
  };
}

export function invoiceAppointmentOptionToMetaInput(
  option: Pick<
    InvoiceAppointmentOptionRow,
    "start" | "end" | "when_label" | "location_label" | "is_telehealth"
  >
): InvoiceVisitMetaInput {
  return {
    start_iso: option.start,
    end_iso: option.end,
    when_label: option.when_label ?? null,
    location_label: option.location_label ?? null,
    is_telehealth: option.is_telehealth ?? false,
  };
}

/**
 * Single source for invoice visit when/location display — use {@link InvoiceVisitMetaLine} in UI.
 * Resolved icon-row fields for variant `icons`.
 */
export function resolveInvoiceVisitMetaIcons(input: InvoiceVisitMetaInput): {
  dateLabel: string | null;
  timeLabel: string | null;
  locationLabel: string | null;
  isTelehealth: boolean;
} {
  const start = input.start_iso?.trim();
  const end = input.end_iso?.trim();
  return {
    dateLabel: start ? formatInvoiceVisitDateLabel(start) : null,
    timeLabel: start && end ? formatInvoiceVisitTimeRange(start, end) : null,
    locationLabel: resolveVisitLocationLabel(input),
    isTelehealth: input.is_telehealth,
  };
}

/** Single muted line — picker tiles + summary subtitle fallback. */
export function formatInvoiceVisitMetaTextLine(input: InvoiceVisitMetaInput): string | null {
  const when =
    input.when_label?.trim() ||
    (() => {
      const start = input.start_iso?.trim();
      const end = input.end_iso?.trim();
      if (!start) return null;
      const date = formatInvoiceVisitDateLabel(start);
      const time = end ? formatInvoiceVisitTimeRange(start, end) : null;
      return [date, time].filter(Boolean).join(" · ") || null;
    })();

  const loc = resolveVisitLocationLabel(input);

  const parts = [when, loc].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
