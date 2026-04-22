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
}

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
