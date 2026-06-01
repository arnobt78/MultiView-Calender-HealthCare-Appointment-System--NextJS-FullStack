import { z } from "zod";
import { INVOICE_STATUSES } from "@/lib/billing-types";

const invoiceStatusSchema = z.enum(INVOICE_STATUSES);

export const invoiceCreateSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  currency: z.string().min(3).max(3).optional().default("eur"),
  description: z.string().max(2000).optional(),
  appointment_id: z.string().uuid().optional(),
  due_date: z.string().optional(),
  organization_id: z.string().uuid().optional(),
});

export const invoicePatchSchema = z.object({
  status: invoiceStatusSchema.optional(),
  description: z.string().max(2000).nullable().optional(),
  due_date: z.string().nullable().optional(),
});

export const invoiceRecordPaymentSchema = z.object({
  note: z.string().max(500).optional(),
});

export const invoiceRefundSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
export type InvoicePatchInput = z.infer<typeof invoicePatchSchema>;
