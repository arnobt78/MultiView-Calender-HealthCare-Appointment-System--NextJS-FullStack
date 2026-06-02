/**
 * Paid revenue collected in a period — prefers paid_at; falls back to created_at when paid_at is null
 * (legacy/mark-as-paid rows) so "Paid in period" matches visible paid status totals.
 */

import type { Prisma } from "@prisma/client";

/** Prisma where for paid invoices counted in a paid_at window (with created_at fallback). */
export function buildInsightsPaidCollectedWhere(
  invoiceBase: Prisma.InvoiceWhereInput,
  range: { gte: Date; lte: Date }
): Prisma.InvoiceWhereInput {
  return {
    ...invoiceBase,
    status: "paid",
    OR: [
      { paid_at: { gte: range.gte, lte: range.lte } },
      {
        paid_at: null,
        created_at: { gte: range.gte, lte: range.lte },
      },
    ],
  };
}

/** All-time paid collected — any row with paid_at set or status paid. */
export function buildInsightsPaidCollectedAllTimeWhere(
  invoiceBase: Prisma.InvoiceWhereInput
): Prisma.InvoiceWhereInput {
  return {
    ...invoiceBase,
    status: "paid",
    OR: [{ paid_at: { not: null } }, { paid_at: null }],
  };
}
