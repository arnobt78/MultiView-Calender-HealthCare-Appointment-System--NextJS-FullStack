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

/** Linked appointment context for invoice list + detail UI. */
export type InvoiceVisitSummary = {
  appointment_id: string;
  title: string;
  start_iso: string;
  end_iso: string;
  when_label: string;
  location_label: string;
  is_telehealth: boolean;
  patient_id: string | null;
  patient_label: string | null;
  patient_email?: string | null;
  patient_birth_date?: string | null;
  /** Acuity tier 1–10 for compact list rows. */
  patient_care_level?: number | null;
  appointment_type_name?: string | null;
  /** Booked slot length — shown on Stripe Checkout description. */
  duration_minutes?: number | null;
  /** Type default when appointment.duration_minutes unset. */
  appointment_type_duration_minutes?: number | null;
  category_id: string | null;
  category_label: string | null;
  category_color: string | null;
  category_icon: string | null;
  treating_physician_id: string | null;
  treating_physician_label: string | null;
  treating_physician_email?: string | null;
  treating_physician_specialty: string | null;
  /** OAuth/upload avatar for treating physician row. */
  treating_physician_image?: string | null;
  treating_physician_role?: string | null;
  calendar_owner_id: string | null;
  calendar_owner_label: string | null;
  calendar_owner_email?: string | null;
  calendar_owner_specialty: string | null;
  calendar_owner_image?: string | null;
  calendar_owner_role?: string | null;
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
  visit_summary?: InvoiceVisitSummary;
  /** Billing owner display — list “Issued by” line (batch-loaded on GET /api/invoices). */
  issuer_label?: string | null;
  issuer_image?: string | null;
};

/** GET /api/billing/appointment-options — rich visit picker row for invoice create dialog. */
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
  /** Visit fee from appointment type or doctor — for manual create prefill when eligible. */
  suggested_amount_cents: number | null;
  /** Raw fee inputs — invoice dialog amount hint (type → doctor → default). */
  appointment_type_price_cents?: number | null;
  doctor_consultation_fee_cents?: number | null;
  /** Rich display — aligned with InvoiceVisitSummary for picker cards. */
  patient_id?: string | null;
  patient_email?: string | null;
  patient_birth_date?: string | null;
  patient_care_level?: number | null;
  patient_clinical_profile?: { image_url?: string } | null;
  when_label?: string;
  location_label?: string | null;
  is_telehealth?: boolean;
  appointment_type_name?: string | null;
  category_id?: string | null;
  category_label?: string | null;
  category_color?: string | null;
  category_icon?: string | null;
  treating_physician_id?: string | null;
  treating_physician_label?: string | null;
  treating_physician_specialty?: string | null;
  calendar_owner_id?: string | null;
  calendar_owner_label?: string | null;
  calendar_owner_specialty?: string | null;
};
