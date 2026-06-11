-- Organization audit trail — mirrors categories/patients created_by / updated_by
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Backfill existing rows — owner as audit actor; updated_at mirrors created_at
UPDATE organizations
SET
  created_by = owner_user_id,
  updated_by = owner_user_id,
  updated_at = created_at
WHERE created_by IS NULL;
