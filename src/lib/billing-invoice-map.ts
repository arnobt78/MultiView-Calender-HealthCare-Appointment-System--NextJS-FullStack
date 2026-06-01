/**
 * Normalizes GET /api/invoices/[id] JSON into InvoiceRow for TanStack cache + hooks.
 */

import type { QueryClient } from "@tanstack/react-query";
import type { InvoiceRow, InvoicePaymentRow } from "@/lib/billing-types";
import { queryKeys } from "@/lib/query-keys";

type ApiPayment = {
  id: string;
  amount: number;
  status: string;
  created_at: string | Date;
  stripe_payment_id?: string | null;
};

type ApiInvoice = {
  id: string;
  user_id: string;
  appointment_id?: string | null;
  organization_id?: string | null;
  amount: number;
  currency: string;
  status: string;
  description?: string | null;
  due_date?: string | Date | null;
  paid_at?: string | Date | null;
  created_at: string | Date;
  payments?: ApiPayment[];
};

function toIsoDateString(value: string | Date | null | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  return value.toISOString();
}

function mapPayment(p: ApiPayment): InvoicePaymentRow {
  return {
    id: p.id,
    amount: p.amount,
    status: p.status,
    created_at:
      typeof p.created_at === "string"
        ? p.created_at
        : p.created_at.toISOString(),
    stripe_payment_id: p.stripe_payment_id ?? undefined,
  };
}

/** Immediate list update after POST/PATCH — avoids waiting on GET /api/payments refetch. */
export function mergeInvoiceIntoListCache(
  queryClient: QueryClient,
  invoice: InvoiceRow
): void {
  queryClient.setQueryData<InvoiceRow[]>(queryKeys.invoices.all, (old) => {
    const list = old ?? [];
    const idx = list.findIndex((row) => row.id === invoice.id);
    if (idx >= 0) {
      const next = [...list];
      next[idx] = invoice;
      return next;
    }
    return [invoice, ...list];
  });
}

export function mapApiInvoiceToRow(raw: ApiInvoice): InvoiceRow {
  return {
    id: raw.id,
    user_id: raw.user_id,
    appointment_id: raw.appointment_id ?? undefined,
    organization_id: raw.organization_id ?? undefined,
    amount: raw.amount,
    currency: raw.currency,
    status: raw.status,
    description: raw.description ?? undefined,
    due_date: toIsoDateString(raw.due_date)?.slice(0, 10),
    paid_at: toIsoDateString(raw.paid_at),
    created_at:
      typeof raw.created_at === "string"
        ? raw.created_at
        : raw.created_at.toISOString(),
    payments: (raw.payments ?? []).map(mapPayment),
  };
}
