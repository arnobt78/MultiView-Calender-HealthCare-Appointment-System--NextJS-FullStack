// App User (matches Supabase Auth user and users table)
export interface User {
  id: UUID; // Supabase Auth user id
  email: string;
  role?: string | null;
  display_name?: string | null;
  image?: string | null;
  created_at?: string;
  /** Doctor specialty — e.g. "Cardiology", "Pediatrics" */
  specialty?: string | null;
  /** Short bio for the doctor services page */
  bio?: string | null;
  /** Contact phone number */
  phone?: string | null;
  /** Medical license or registration number */
  license_number?: string | null;
  /** Department or unit within the clinic/hospital */
  department?: string | null;
  /** Consultation fee in cents (for Services page display) */
  consultation_fee?: number | null;
  /** Physical office or room location */
  office_location?: string | null;
  /** Languages the doctor consults in */
  languages_spoken?: string[];
  /** Years of clinical practice experience */
  years_of_experience?: number | null;
  /** Doctor account active flag — default true when unset (demo deactivate without delete). */
  is_active?: boolean;
  active_since?: string | null;
}
export type UUID = string;

/** Optional structured clinical/demo payload stored as JSON on Patient */
export type PatientClinicalProfile = {
  allergies?: string[];
  conditions?: string[];
  medications_current?: string[];
  notes?: string;
  /** Where the record originated — drives optional `referral_detail` */
  referral_source?: string;
  referral_detail?: string;
  /** Optional portrait URL stored in JSON (portal, uploads, or integrations). */
  image_url?: string;
} | null;

// Patient
export interface Patient {
  id: UUID;
  firstname: string;
  lastname: string;
  birth_date: string | null;
  care_level: number | null;
  pronoun: string | null;
  email: string | null;
  active: boolean;
  active_since: string | null;
  created_at: string;
  /** Server-maintained; shown on detail for audit */
  updated_at?: string | null;
  clinical_profile?: PatientClinicalProfile;
  created_by_id?: string | null;
  updated_by_id?: string | null;
  primary_doctor_id?: string | null;
  created_by_display?: string | null;
  updated_by_display?: string | null;
  created_by_email?: string | null;
  updated_by_email?: string | null;
  primary_doctor_display?: string | null;
  primary_doctor_email?: string | null;
  primary_doctor_specialty?: string | null;
  /** Denormalized primary doctor portrait from SSR patient include. */
  primary_doctor_image?: string | null;
  /** ABO/Rh blood type — e.g. "A+", "O-" */
  blood_type?: string | null;
  /** Height in centimetres */
  height_cm?: number | null;
  /** Body weight in kilograms */
  weight_kg?: number | null;
  /** Health insurance provider name */
  insurance_provider?: string | null;
  /** Insurance membership / policy ID */
  insurance_id?: string | null;
  /** Preferred language for consultations */
  preferred_language?: string | null;
  /** National ID or passport number */
  national_id?: string | null;
  /** Patient occupation or profession */
  occupation?: string | null;
}

/** Serialized invoice row (matches `serializeInvoice` from API) */
export type SnapshotInvoice = {
  id: UUID;
  created_at: string;
  appointment_id: string | null;
  user_id: UUID;
  amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  description: string | null;
  /** For Refunded display via shared InvoiceStatusBadge on patient snapshot. */
  payments?: { status: string }[];
  visit_summary?: import("@/lib/billing-types").InvoiceVisitSummary;
};

/** Appointment row from snapshot API (adds category label + B2 owner / treating columns for patient detail table). */
export type AppointmentSnapshotRow = Appointment & {
  category_label?: string | null;
  /** Hex swatch for category column (from `categories.color`). */
  category_color?: string | null;
  /** Lucide icon name for category brand mark (from `categories.icon`). */
  category_icon?: string | null;
  /** Visit type name for two-line Title column (from `appointment_types.name`). */
  appointment_type_name?: string | null;
  /** Calendar row owner (wire `user_id`; Prisma `owner_id`). */
  calendar_owner_id?: string | null;
  calendar_owner_display?: string | null;
  calendar_owner_email?: string | null;
  /** OAuth/upload portrait for calendar owner — avoids robohash when `useUsers` is still loading. */
  calendar_owner_image?: string | null;
  /** Resolved treating / clinical user (`treating_physician_id ?? user_id`). */
  doctor_id?: string | null;
  doctor_display?: string | null;
  doctor_email?: string | null;
  doctor_specialty?: string | null;
  doctor_image?: string | null;
  /** Denormalized patient fields for category snapshot / multi-patient tables. */
  patient_firstname?: string | null;
  patient_lastname?: string | null;
  patient_email?: string | null;
  patient_birth_date?: string | null;
  patient_clinical_profile?: Patient["clinical_profile"];
};

export type PatientSnapshot = {
  patient: Patient;
  appointments: AppointmentSnapshotRow[];
  invoices: SnapshotInvoice[];
  /** Full appointment count for section badge (table rows capped at 50). */
  appointmentTotalCount: number;
  /** Invoices linked to this patient's appointments (via appointment_id). */
  invoiceTotalCount: number;
};

/** Appointment row on category snapshot — full clinical table projection (same as patient snapshot). */
export type CategorySnapshotAppointmentRow = AppointmentSnapshotRow;

export type CategorySnapshot = {
  category: Category;
  appointments: CategorySnapshotAppointmentRow[];
  totalCount: number;
};

// Category (appointment category / service type)
export interface Category {
  id: UUID;
  created_at: string;
  updated_at: string | null;
  label: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_active?: boolean;
  sort_order?: number;
  duration_minutes_default?: number | null;
  created_by_id?: string | null;
  updated_by_id?: string | null;
  created_by_display?: string | null;
  updated_by_display?: string | null;
  created_by_email?: string | null;
  updated_by_email?: string | null;
}

// Appointment
export interface Appointment {
  id: UUID;
  created_at: string;
  updated_at: string | null;
  start: string;
  end: string;
  location: string | null;
  patient: UUID | null;
  attachments: string[];
  category: UUID | null;
  notes: string | null;
  title: string;
  status?: "done" | "pending" | "alert" | string | null;
  /** Calendar row owner — JSON `user_id` (Prisma field `owner_id` @map user_id). */
  user_id: UUID;
  /** B2: optional treating physician FK; display uses `resolveTreatingPhysicianUserId` (defaults to calendar owner). */
  treating_physician_id?: string | null;
  /** FK to appointment_types — drives slot math and telehealth flag */
  appointment_type_id?: string | null;
  /** Denormalised from appointment_type.is_telehealth — true = show telehealth badge and Join Call button */
  is_telehealth?: boolean;
  /** Presenting complaint / reason for visit from the patient */
  chief_complaint?: string | null;
  /** Actual appointment duration in minutes (may differ from type default) */
  duration_minutes?: number | null;
  /** Video call / telehealth meeting URL */
  telehealth_link?: string | null;
}

// Appointment Assignee
export interface AppointmentAssignee {
  id: UUID;
  created_at: string;
  appointment: UUID;
  user: UUID | null; // Can be null when user_type is "patients"
  user_type: "patients";
  status?: "pending" | "accepted" | "declined";
  permission?: "read" | "write" | "full";
  invited_email?: string;
}

// AppointmentType — visit/service type (global or doctor-owned)
export interface AppointmentType {
  id: UUID;
  created_at: string;
  user_id: string | null;
  name: string;
  description: string | null;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  minimum_notice_minutes: number;
  /** When true: conducted via video call — shows telehealth badge */
  is_telehealth: boolean;
  /** Hex color for calendar chip display (e.g. "#4F46E5") */
  color?: string | null;
  /** Lucide icon name displayed beside the type label */
  icon?: string | null;
  /** Soft-delete — inactive types hidden from booking */
  is_active: boolean;
  /** For patient booking: whether this doctor has enabled this global type */
  is_enabled?: boolean;
}

// DoctorAppointmentTypeConfig — junction: doctor ↔ global appointment type
export interface DoctorAppointmentTypeConfig {
  id: UUID;
  doctor_id: UUID;
  appointment_type_id: UUID;
  is_enabled: boolean;
  created_at: string;
}

// Doctor card row (returned by GET /api/doctors)
export interface DoctorRow {
  id: UUID;
  email: string;
  display_name: string | null;
  image: string | null;
  specialty: string | null;
  bio: string | null;
  created_at: string;
  phone?: string | null;
  license_number?: string | null;
  consultation_fee?: number | null;
  languages_spoken?: string[];
  years_of_experience?: number | null;
  office_location?: string | null;
  availabilities: { weekday: number; start_min: number; end_min: number; timezone: string }[];
  appointment_types: Pick<AppointmentType, "id" | "name" | "duration_minutes" | "is_telehealth">[];
  patient_count: number;
}

// DoctorPortalData — shape returned by GET /api/doctor-portal (SSR prefetch)
export interface DoctorPortalData {
  doctor: User;
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  patients: Patient[];
  enabledTypes: AppointmentType[];
  allGlobalTypes: AppointmentType[];
  typeConfigs: DoctorAppointmentTypeConfig[];
  metrics: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    pending: number;
    done: number;
    overdue: number;
  };
}

// AdminPortalData — shape returned by GET /api/admin-portal (SSR prefetch)
export interface AdminPortalData {
  overview: {
    totalAppointments: number;
    todayAppointments: number;
    totalPatients: number;
    totalDoctors: number;
    pendingAppointments: number;
    overdueAppointments: number;
    paidRevenueCents: number;
    outstandingRevenueCents: number;
  };
  doctors: DoctorRow[];
  recentAppointments: Appointment[];
}
