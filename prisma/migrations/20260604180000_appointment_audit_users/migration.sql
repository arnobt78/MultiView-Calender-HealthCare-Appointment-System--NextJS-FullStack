-- Appointment audit trail — mirrors patients/categories created_by / updated_by
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

UPDATE appointments
SET created_by = user_id
WHERE created_by IS NULL;

UPDATE appointments
SET updated_by = user_id
WHERE updated_by IS NULL AND updated_at IS NOT NULL;
