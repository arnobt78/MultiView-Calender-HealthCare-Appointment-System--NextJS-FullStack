/**
 * Database Seed Script for multiview-calender-appointment
 *
 * This script migrates data from CSV files to PostgreSQL database.
 *
 * Migration Status: 🔄 IN PROGRESS
 * - Migrates data from Supabase/NeonDB CSV exports to Hetzner VPS PostgreSQL database
 *
 * Usage:
 *   npm run db:seed
 *
 * Note: This script uses upsert (INSERT ... ON CONFLICT), so it's safe to run multiple times.
 * It will update existing records or create new ones.
 *
 * Appointments CSV may optionally include `treating_physician_id` (B2); when absent, seed sets it to `user_id`.
 */

import { config } from "dotenv";
import { resolve, join } from "path";
import { parse } from "csv-parse/sync";
import * as fs from "fs";

// Load environment variables from .env.local FIRST (before any imports that use env vars)
config({ path: resolve(process.cwd(), ".env.local") });

// CSV file paths
// Set CSV_DIR environment variable or use default relative path
const CSV_DIR = process.env.CSV_DIR || resolve(process.cwd(), "data", "csv");

// Interface definitions matching CSV structure
interface UserRow {
  id: string;
  email: string;
  role: string | null;
  display_name: string | null;
  created_at: string;
}

interface AppointmentRow {
  id: string;
  created_at: string;
  updated_at: string | null;
  start: string;
  end: string;
  location: string | null;
  patient: string | null;
  attachments: string; // JSON array string
  category: string | null;
  notes: string | null;
  title: string;
  status: string | null;
  /** DB column `user_id` — calendar owner (matches Prisma `owner_id` @map). */
  user_id: string;
  /**
   * Optional B2 FK to `users.id` (DB `treating_physician_id`). When omitted in CSV, seed defaults to `user_id`
   * so portal / snapshot “treating” columns never stay NULL for legacy exports.
   */
  treating_physician_id?: string | null;
}

interface AppointmentAssigneeRow {
  id: string;
  created_at: string;
  appointment: string;
  user: string | null;
  user_type: string | null;
  invited_email: string | null;
  status: string | null;
  invitation_token: string | null;
  permission: string | null;
  invited_by: string | null;
}

interface CategoryRow {
  id: string;
  created_at: string;
  updated_at: string | null;
  label: string;
  description: string | null;
  color: string | null;
  icon: string | null;
}

interface PatientRow {
  id: string;
  created_at: string;
  firstname: string;
  lastname: string;
  birth_date: string | null;
  care_level: string | null;
  pronoun: string | null;
  email: string | null;
  active: string | null;
  active_since: string | null;
}

/**
 * Parse CSV file and return array of records
 */
async function parseCSV<T>(filePath: string): Promise<T[]> {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  CSV file not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records as T[];
}

/**
 * Parse JSON field (for arrays like attachments)
 */
function parseJSONField(field: string): any {
  if (!field || field === "null" || field === "" || field === "[]") {
    return null;
  }
  try {
    // Handle empty arrays/objects
    if (field === "[]") return [];
    if (field === "{}") return {};
    return JSON.parse(field);
  } catch (e) {
    console.warn(`Failed to parse JSON field: ${field}`, e);
    return field;
  }
}

/**
 * Parse boolean value from string
 */
function parseBoolean(value: string | null): boolean | null {
  if (!value || value === "null" || value === "") return null;
  return value === "true" || value === "1" || value === "t";
}

/**
 * Seed users table
 */
async function seedUsers(query: any) {
  const users = await parseCSV<UserRow>(join(CSV_DIR, "users.csv"));

  if (users.length === 0) {
    return;
  }

  for (const user of users) {
    try {
      await query(
        `INSERT INTO users (id, email, role, display_name, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) 
         DO UPDATE SET 
           email = EXCLUDED.email,
           role = EXCLUDED.role,
           display_name = EXCLUDED.display_name,
           created_at = EXCLUDED.created_at`,
        [
          user.id,
          user.email,
          user.role || null,
          user.display_name || null,
          new Date(user.created_at),
        ]
      );
    } catch (error) {
      console.error(`❌ Error seeding user ${user.id}:`, error);
    }
  }
}

/**
 * After CSV import, enrich known demo rows with clinical JSON, care tier, and audit FKs when those columns exist (`prisma db push`).
 */
async function enrichDemoPatientAuditAndClinical(query: any) {
  try {
    const check = await query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'updated_at' LIMIT 1`
    );
    if (!check.rows?.length) return;
    const clinical = JSON.stringify({
      allergies: ["penicillin (demo)"],
      notes: "Seeded clinical profile for Patient Management / snapshot demos.",
      referral_source: "control_panel",
    });
    await query(
      `UPDATE patients SET
        care_level = COALESCE(care_level, 1),
        clinical_profile = $1::jsonb,
        updated_at = NOW(),
        created_by = COALESCE(created_by, (SELECT id FROM users WHERE role = $2 ORDER BY created_at ASC LIMIT 1)),
        updated_by = COALESCE(updated_by, (SELECT id FROM users WHERE role = $2 ORDER BY created_at ASC LIMIT 1))
      WHERE LOWER(TRIM(COALESCE(email, ''))) = LOWER(TRIM($3))`,
      [clinical, "admin", "test@patient.com"]
    );
  } catch (e) {
    console.warn("enrichDemoPatientAuditAndClinical skipped:", e);
  }
}

/**
 * Seed patients table
 */
async function seedPatients(query: any) {
  const patients = await parseCSV<PatientRow>(join(CSV_DIR, "patients.csv"));

  if (patients.length === 0) {
    return;
  }

  for (const patient of patients) {
    try {
      await query(
        `INSERT INTO patients (id, created_at, firstname, lastname, birth_date, care_level, pronoun, email, active, active_since)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) 
         DO UPDATE SET 
           firstname = EXCLUDED.firstname,
           lastname = EXCLUDED.lastname,
           birth_date = EXCLUDED.birth_date,
           care_level = EXCLUDED.care_level,
           pronoun = EXCLUDED.pronoun,
           email = EXCLUDED.email,
           active = EXCLUDED.active,
           active_since = EXCLUDED.active_since`,
        [
          patient.id,
          new Date(patient.created_at),
          patient.firstname,
          patient.lastname,
          patient.birth_date ? new Date(patient.birth_date) : null,
          patient.care_level ? parseInt(patient.care_level) : null,
          patient.pronoun || null,
          patient.email || null,
          parseBoolean(patient.active),
          patient.active_since ? new Date(patient.active_since) : null,
        ]
      );
    } catch (error) {
      console.error(`❌ Error seeding patient ${patient.id}:`, error);
    }
  }
}

/**
 * Seed categories table
 */
async function seedCategories(query: any) {
  const categories = await parseCSV<CategoryRow>(join(CSV_DIR, "categories.csv"));

  if (categories.length === 0) {
    return;
  }

  for (const category of categories) {
    try {
      await query(
        `INSERT INTO categories (id, created_at, updated_at, label, description, color, icon)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) 
         DO UPDATE SET 
           updated_at = EXCLUDED.updated_at,
           label = EXCLUDED.label,
           description = EXCLUDED.description,
           color = EXCLUDED.color,
           icon = EXCLUDED.icon`,
        [
          category.id,
          new Date(category.created_at),
          category.updated_at ? new Date(category.updated_at) : null,
          category.label,
          category.description || null,
          category.color || null,
          category.icon || null,
        ]
      );
    } catch (error) {
      console.error(`❌ Error seeding category ${category.id}:`, error);
    }
  }
}

/**
 * Seed appointments table (`user_id` = calendar owner; `treating_physician_id` = B2 clinical FK when present in CSV).
 */
async function seedAppointments(query: any) {
  const appointments = await parseCSV<AppointmentRow>(join(CSV_DIR, "appointments.csv"));

  if (appointments.length === 0) {
    return;
  }

  for (const appointment of appointments) {
    try {
      const treatingId =
        appointment.treating_physician_id?.trim() || appointment.user_id;
      await query(
        `INSERT INTO appointments (id, created_at, updated_at, "start", "end", location, patient, attachments, category, notes, title, status, user_id, treating_physician_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) 
         DO UPDATE SET 
           updated_at = EXCLUDED.updated_at,
           "start" = EXCLUDED."start",
           "end" = EXCLUDED."end",
           location = EXCLUDED.location,
           patient = EXCLUDED.patient,
           attachments = EXCLUDED.attachments,
           category = EXCLUDED.category,
           notes = EXCLUDED.notes,
           title = EXCLUDED.title,
           status = EXCLUDED.status,
           user_id = EXCLUDED.user_id,
           treating_physician_id = EXCLUDED.treating_physician_id`,
        [
          appointment.id,
          new Date(appointment.created_at),
          appointment.updated_at ? new Date(appointment.updated_at) : null,
          new Date(appointment.start),
          new Date(appointment.end),
          appointment.location || null,
          appointment.patient || null,
          parseJSONField(appointment.attachments),
          appointment.category || null,
          appointment.notes || null,
          appointment.title,
          appointment.status || null,
          appointment.user_id,
          treatingId,
        ]
      );
    } catch (error) {
      console.error(`❌ Error seeding appointment ${appointment.id}:`, error);
    }
  }
}

/**
 * Seed appointment_assignee table
 */
async function seedAppointmentAssignees(query: any) {
  const assignees = await parseCSV<AppointmentAssigneeRow>(
    join(CSV_DIR, "appointment_assignee.csv")
  );

  if (assignees.length === 0) {
    return;
  }

  for (const assignee of assignees) {
    try {
      // If user_type is "patients", the user field contains a patient ID, not a user ID
      // So we need to set user to NULL to satisfy the foreign key constraint
      // (The patient relationship is handled separately)
      let userId = assignee.user || null;
      if (assignee.user_type === "patients" && assignee.user) {
        // Check if this ID exists in users table, if not, set to NULL
        const userCheck = await query("SELECT id FROM users WHERE id = $1", [assignee.user]);
        if (userCheck.rows.length === 0) {
          userId = null; // Patient ID, not a user ID
        }
      }
      
      await query(
        `INSERT INTO appointment_assignee (id, created_at, appointment, "user", user_type, invited_email, status, invitation_token, permission, invited_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) 
         DO UPDATE SET 
           appointment = EXCLUDED.appointment,
           "user" = EXCLUDED."user",
           user_type = EXCLUDED.user_type,
           invited_email = EXCLUDED.invited_email,
           status = EXCLUDED.status,
           invitation_token = EXCLUDED.invitation_token,
           permission = EXCLUDED.permission,
           invited_by = EXCLUDED.invited_by`,
        [
          assignee.id,
          new Date(assignee.created_at),
          assignee.appointment,
          userId,
          assignee.user_type || null,
          assignee.invited_email || null,
          assignee.status || null,
          assignee.invitation_token || null,
          assignee.permission || null,
          assignee.invited_by || null,
        ]
      );
    } catch (error) {
      console.error(`❌ Error seeding appointment assignee ${assignee.id}:`, error);
    }
  }
}

/**
 * Main seed function
 */
async function runSeed() {

  // Import after loading env vars (inside async function to avoid top-level await)
  const { pool, query } = await import("../src/lib/postgresClient");

  try {
    // Test connection
    await query("SELECT NOW()");

    // Seed in order to maintain foreign key relationships
    await seedUsers(query);
    await seedPatients(query);
    await enrichDemoPatientAuditAndClinical(query);
    await seedCategories(query);
    await seedAppointments(query);
    await seedAppointmentAssignees(query);

    // Note: activities, dashboard_access, and relatives tables are empty
    // (no CSV files provided), so they will remain empty

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed script
runSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});

