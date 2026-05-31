-- Category audit trail — mirrors patients.created_by / patients.updated_by
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;
