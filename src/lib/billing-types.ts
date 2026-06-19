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
  /** Set when status becomes refunded — preferred over created_at for UI dates. */
  refunded_at?: string | null;
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
  /** Linked visit status — gates billing mutate when cancelled (REQ-0111). */
  appointment_status?: string | null;
  patient_id: string | null;
  patient_label: string | null;
  patient_email?: string | null;
  patient_birth_date?: string | null;
  /** Portrait URL inside `clinical_profile` — invoice linked visit patient row. */
  patient_clinical_profile?: { image_url?: string } | null;
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
  /** Visit type list price — invoice dialog fee hint (type → doctor fallback). */
  appointment_type_price_cents?: number | null;
  doctor_consultation_fee_cents?: number | null;
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
  cancelled_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by_id?: string | null;
  updated_by_id?: string | null;
  created_by_display?: string | null;
  updated_by_display?: string | null;
  created_by_email?: string | null;
  updated_by_email?: string | null;
  created_by_image?: string | null;
  created_by_role?: string | null;
  updated_by_image?: string | null;
  updated_by_role?: string | null;
  payments: InvoicePaymentRow[];
  visit_summary?: InvoiceVisitSummary;
  /** Set when linked appointment was deleted — drives rose meta + snapshot hydration (REQ-0113). */
  visit_detached_at?: string | null;
  visit_snapshot?: InvoiceVisitSummary | null;
  /** Frozen actor when visit detached (REQ-0114). */
  visit_detached_by_id?: string | null;
  visit_detached_by_display?: string | null;
  visit_detached_by_email?: string | null;
  visit_detached_by_image?: string | null;
  visit_detached_by_role?: string | null;
  /** Soft-delete tombstone (REQ-0114). */
  deleted_at?: string | null;
  deleted_by_id?: string | null;
  deleted_by_display?: string | null;
  deleted_by_email?: string | null;
  deleted_by_image?: string | null;
  deleted_by_role?: string | null;
  /** Billing owner display (`user_id`) — not the session actor who issued the draft. */
  issuer_label?: string | null;
  issuer_image?: string | null;
  issuer_email?: string | null;
  issuer_role?: string | null;
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
  treating_physician_email?: string | null;
  treating_physician_specialty?: string | null;
  treating_physician_image?: string | null;
  treating_physician_role?: string | null;
  calendar_owner_id?: string | null;
  calendar_owner_label?: string | null;
  calendar_owner_email?: string | null;
  calendar_owner_specialty?: string | null;
  calendar_owner_image?: string | null;
  calendar_owner_role?: string | null;
  duration_minutes?: number | null;
  appointment_type_duration_minutes?: number | null;
};
