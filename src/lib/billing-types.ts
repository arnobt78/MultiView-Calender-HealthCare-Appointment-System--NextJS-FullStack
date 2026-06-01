/**
 * Shared billing types — API, hooks, and UI import from here (single shape).
 */

export const INVOICE_STATUSES = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "succeeded",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Invoice access — used by REST, SSR, and UI capability checks. */
export type InvoiceAccessLevel = "none" | "view" | "mutate" | "pay" | "admin";

export type InvoicePaymentRow = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  stripe_payment_id?: string;
};

export type InvoiceRow = {
  id: string;
  appointment_id?: string;
  user_id: string;
  organization_id?: string | null;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
  payments: InvoicePaymentRow[];
};

/** GET /api/billing/appointment-options — compact visit picker row. */
export type InvoiceAppointmentOptionRow = {
  id: string;
  title: string;
  start: string;
  end: string;
  owner_id: string;
  patient_label: string;
  eligible: boolean;
  block_reason: string | null;
  invoice_id: string | null;
  invoice_status: string | null;
  display_status: string | null;
  amount_cents: number | null;
  currency: string | null;
};
