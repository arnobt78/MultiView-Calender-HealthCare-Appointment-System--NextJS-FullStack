/**
 * Deterministic 10-row demo appointment matrix — exported for seed + unit tests.
 * Marker v2: admin created_by, one visit-cancelled row, relative scheduling.
 */

export const DEMO_CURATED_SEED_MARKER = "seed-demo-curated:v2";

export const DEMO_CURATED_ORG_SLUG = "healthcal-demo-clinic";

export const DEMO_CURATED_TYPE_IDS = {
  initial: "22222222-2222-4222-8222-222222222201",
  followUp: "22222222-2222-4222-8222-222222222202",
  telehealth: "22222222-2222-4222-8222-222222222203",
  annual: "22222222-2222-4222-8222-222222222204",
} as const;

export type DemoCuratedTypeKey = keyof typeof DEMO_CURATED_TYPE_IDS;

export const DEMO_CURATED_DOCTOR_EMAILS = [
  "test@doctor.com",
  "demo.doctor2@healthcal.dev",
  "demo.doctor3@healthcal.dev",
  "demo.doctor4@healthcal.dev",
  "demo.doctor5@healthcal.dev",
  "demo.doctor6@healthcal.dev",
  "demo.doctor7@healthcal.dev",
  "demo.doctor8@healthcal.dev",
] as const;

export const DEMO_CURATED_PATIENT_EMAILS = [
  "test@patient.com",
  "maria.schmidt@demo.healthcal",
  "jan.mueller@demo.healthcal",
  "anya.petrov@demo.healthcal",
  "thomas.weber@demo.healthcal",
] as const;

export const DEMO_CURATED_ADMIN_EMAIL = "test@admin.com";

export type DemoCuratedInvoiceSpec =
  | { kind: "none" }
  | { kind: "paid"; stripeId: string }
  | { kind: "draft" }
  | { kind: "sent" }
  | { kind: "cancelled" }
  | { kind: "refunded"; stripeId: string };

export type DemoCuratedAppointmentStatus = "done" | "pending" | "alert" | "cancelled";

export type DemoCuratedRow = {
  titleSuffix: string;
  patientEmail: (typeof DEMO_CURATED_PATIENT_EMAILS)[number];
  ownerEmail: string;
  treatingEmail: string;
  status: DemoCuratedAppointmentStatus;
  /** Days offset from today (UTC date); negative = past. */
  daysFromNow: number;
  /** Start hour UTC (0–23). */
  hourUtc: number;
  durationMin: number;
  telehealth: boolean;
  typeKey: DemoCuratedTypeKey;
  invoice: DemoCuratedInvoiceSpec;
  /** When status is cancelled — who cancelled (defaults to admin). */
  cancelledByEmail?: string;
};

/** Exactly 10 rows — varied owners, patients, billing, one visit-cancelled. */
export const DEMO_CURATED_ROWS: DemoCuratedRow[] = [
  {
    titleSuffix: "01-admin-owner-historical-paid",
    patientEmail: "test@patient.com",
    ownerEmail: DEMO_CURATED_ADMIN_EMAIL,
    treatingEmail: "test@doctor.com",
    status: "done",
    daysFromNow: -14,
    hourUtc: 9,
    durationMin: 30,
    telehealth: false,
    typeKey: "followUp",
    invoice: { kind: "paid", stripeId: "pi_demo_curated_paid_01" },
  },
  {
    titleSuffix: "02-doctor-owner-today-pending-cancel-qa",
    patientEmail: "test@patient.com",
    ownerEmail: "test@doctor.com",
    treatingEmail: "test@doctor.com",
    status: "pending",
    daysFromNow: 0,
    hourUtc: 10,
    durationMin: 30,
    telehealth: false,
    typeKey: "initial",
    invoice: { kind: "none" },
  },
  {
    titleSuffix: "03-doc4-owner-cross-doctor-paid",
    patientEmail: "thomas.weber@demo.healthcal",
    ownerEmail: "demo.doctor4@healthcal.dev",
    treatingEmail: "test@doctor.com",
    status: "done",
    daysFromNow: -21,
    hourUtc: 11,
    durationMin: 45,
    telehealth: false,
    typeKey: "annual",
    invoice: { kind: "paid", stripeId: "pi_demo_curated_paid_03" },
  },
  {
    titleSuffix: "04-doctor-owner-today-alert-telehealth",
    patientEmail: "maria.schmidt@demo.healthcal",
    ownerEmail: "test@doctor.com",
    treatingEmail: "demo.doctor2@healthcal.dev",
    status: "alert",
    daysFromNow: 0,
    hourUtc: 11,
    durationMin: 30,
    telehealth: true,
    typeKey: "telehealth",
    invoice: { kind: "draft" },
  },
  {
    titleSuffix: "05-doc2-owner-sent-invoice",
    patientEmail: "jan.mueller@demo.healthcal",
    ownerEmail: "demo.doctor2@healthcal.dev",
    treatingEmail: "demo.doctor3@healthcal.dev",
    status: "done",
    daysFromNow: -10,
    hourUtc: 8,
    durationMin: 30,
    telehealth: false,
    typeKey: "followUp",
    invoice: { kind: "sent" },
  },
  {
    titleSuffix: "06-doc5-owner-visit-cancelled-audit",
    patientEmail: "anya.petrov@demo.healthcal",
    ownerEmail: "demo.doctor5@healthcal.dev",
    treatingEmail: "test@doctor.com",
    status: "cancelled",
    daysFromNow: -7,
    hourUtc: 13,
    durationMin: 30,
    telehealth: false,
    typeKey: "initial",
    invoice: { kind: "none" },
    cancelledByEmail: DEMO_CURATED_ADMIN_EMAIL,
  },
  {
    titleSuffix: "07-doc6-owner-refunded",
    patientEmail: "thomas.weber@demo.healthcal",
    ownerEmail: "demo.doctor6@healthcal.dev",
    treatingEmail: "test@doctor.com",
    status: "done",
    daysFromNow: -30,
    hourUtc: 15,
    durationMin: 45,
    telehealth: false,
    typeKey: "annual",
    invoice: { kind: "refunded", stripeId: "pi_demo_curated_ref_07" },
  },
  {
    titleSuffix: "08-doc7-owner-future-pending",
    patientEmail: "maria.schmidt@demo.healthcal",
    ownerEmail: "demo.doctor7@healthcal.dev",
    treatingEmail: "demo.doctor8@healthcal.dev",
    status: "pending",
    daysFromNow: 14,
    hourUtc: 9,
    durationMin: 30,
    telehealth: false,
    typeKey: "followUp",
    invoice: { kind: "none" },
  },
  {
    titleSuffix: "09-doc8-owner-done-no-invoice",
    patientEmail: "anya.petrov@demo.healthcal",
    ownerEmail: "demo.doctor8@healthcal.dev",
    treatingEmail: "demo.doctor7@healthcal.dev",
    status: "done",
    daysFromNow: -5,
    hourUtc: 10,
    durationMin: 30,
    telehealth: true,
    typeKey: "telehealth",
    invoice: { kind: "none" },
  },
  {
    titleSuffix: "10-doctor-owner-today-afternoon",
    patientEmail: "jan.mueller@demo.healthcal",
    ownerEmail: "test@doctor.com",
    treatingEmail: "demo.doctor4@healthcal.dev",
    status: "pending",
    daysFromNow: 0,
    hourUtc: 16,
    durationMin: 30,
    telehealth: false,
    typeKey: "followUp",
    invoice: { kind: "none" },
  },
];

/** Resolve start/end from relative day + UTC hour (stable across re-seeds). */
export function resolveCuratedSlot(
  daysFromNow: number,
  hourUtc: number,
  durationMin: number,
  now: Date = new Date()
): { start: Date; end: Date } {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() + daysFromNow);
  start.setUTCHours(hourUtc, 0, 0, 0);
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  return { start, end };
}
