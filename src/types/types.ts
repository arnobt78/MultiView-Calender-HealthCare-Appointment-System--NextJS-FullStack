// App User (matches Supabase Auth user and users table)
export interface User {
  id: UUID; // Supabase Auth user id
  email: string;
  role?: string | null;
  display_name?: string | null;
  image?: string | null;
  created_at?: string;
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
}

/** GET /api/patients/[id]/snapshot — aggregate for profile tabs */
export type PatientSnapshotActivity = {
  id: UUID;
  created_at: string;
  created_by: UUID | null;
  appointment: UUID;
  type: string;
  content: string;
  created_by_display?: string | null;
};

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
};

/** Appointment row from snapshot API (adds category label for display) */
export type AppointmentSnapshotRow = Appointment & { category_label?: string | null };

export type PatientSnapshot = {
  patient: Patient;
  appointments: AppointmentSnapshotRow[];
  activities: PatientSnapshotActivity[];
  invoices: SnapshotInvoice[];
};

// Relative
export interface Relative {
  id: UUID;
  created_at: string;
  firstname: string;
  lastname: string;
  pronoun: string;
  notes: string;
}

// Category
export interface Category {
  id: UUID;
  created_at: string;
  updated_at: string | null;
  label: string;
  description: string | null;
  color: string | null;
  icon: string | null;
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
  attachements: string[];
  category: UUID | null;
  notes: string | null;
  title: string;
  status?: "done" | "pending" | "alert" | string | null;
  user_id: UUID;
}

// Appointment Assignee
export interface AppointmentAssignee {
  id: UUID;
  created_at: string;
  appointment: UUID;
  user: UUID | null; // Can be null when user_type is "patients" or "relatives" (they're not users)
  user_type: "relatives" | "patients";
  status?: "pending" | "accepted" | "declined";
  permission?: "read" | "write" | "full";
  invited_email?: string;
}

// Activity
export interface Activity {
  id: UUID;
  created_at: string;
  created_by: UUID;
  appointment: UUID;
  type: string;
  content: string;
}
