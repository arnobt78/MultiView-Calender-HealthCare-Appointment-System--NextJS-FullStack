-- 006_extend_schema.sql
-- Extends the schema with real-world healthcare attributes:
--   - User: doctor-specific professional fields
--   - Patient: clinical / administrative health fields
--   - Appointment: appointment type FK, telehealth flag, chief complaint, duration, meeting link
--   - AppointmentType: telehealth flag, color, icon, is_active
--   - Organization: timezone, logo_url, org_type
--   - New: doctor_appointment_type_configs junction table

-- ─── User: doctor-specific professional fields ─────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone                TEXT,
  ADD COLUMN IF NOT EXISTS license_number       TEXT,
  ADD COLUMN IF NOT EXISTS department           TEXT,
  ADD COLUMN IF NOT EXISTS consultation_fee     INTEGER,
  ADD COLUMN IF NOT EXISTS office_location      TEXT,
  ADD COLUMN IF NOT EXISTS languages_spoken     TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS years_of_experience  INTEGER;

-- ─── Patient: health & administrative fields ───────────────────────────────────
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS blood_type           TEXT,
  ADD COLUMN IF NOT EXISTS height_cm            INTEGER,
  ADD COLUMN IF NOT EXISTS weight_kg            NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS insurance_provider   TEXT,
  ADD COLUMN IF NOT EXISTS insurance_id         TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language   TEXT,
  ADD COLUMN IF NOT EXISTS national_id          TEXT,
  ADD COLUMN IF NOT EXISTS occupation           TEXT;

-- ─── AppointmentType: telehealth, visual metadata, soft-delete ────────────────
ALTER TABLE appointment_types
  ADD COLUMN IF NOT EXISTS is_telehealth        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS color                TEXT,
  ADD COLUMN IF NOT EXISTS icon                 TEXT,
  ADD COLUMN IF NOT EXISTS is_active            BOOLEAN NOT NULL DEFAULT TRUE;

-- ─── Appointment: appointment type FK, telehealth, clinical fields ─────────────
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS appointment_type_id  UUID REFERENCES appointment_types(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_telehealth        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS chief_complaint      TEXT,
  ADD COLUMN IF NOT EXISTS duration_minutes     INTEGER,
  ADD COLUMN IF NOT EXISTS telehealth_link      TEXT;

CREATE INDEX IF NOT EXISTS appointments_appointment_type_id_idx
  ON appointments (appointment_type_id);

-- ─── Organization: clinic metadata ────────────────────────────────────────────
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS timezone             TEXT,
  ADD COLUMN IF NOT EXISTS logo_url             TEXT,
  ADD COLUMN IF NOT EXISTS org_type             TEXT;

-- ─── New table: doctor_appointment_type_configs ────────────────────────────────
-- Junction table tracking which global appointment types each doctor has enabled.
-- Absence of a row = type is enabled by default for that doctor.
-- is_enabled = false means the doctor has opted out of this global type.
CREATE TABLE IF NOT EXISTS doctor_appointment_type_configs (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_type_id  UUID        NOT NULL REFERENCES appointment_types(id) ON DELETE CASCADE,
  is_enabled           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (doctor_id, appointment_type_id)
);

CREATE INDEX IF NOT EXISTS doctor_apt_type_configs_doctor_idx
  ON doctor_appointment_type_configs (doctor_id);
