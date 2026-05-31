-- 008_user_doctor_active_status.sql
-- Doctor deactivate/activate — mirrors patients.active / patients.active_since pattern.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS active_since  TIMESTAMPTZ;
