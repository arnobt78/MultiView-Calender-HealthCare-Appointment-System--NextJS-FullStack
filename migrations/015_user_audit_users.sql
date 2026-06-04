-- User (doctor/admin) audit trail — Record Audit on `/doctors/:id` and CP user detail
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

UPDATE users u
SET created_by = a.id
FROM users a
WHERE u.created_by IS NULL
  AND a.email = 'test@admin.com';

UPDATE users
SET updated_by = COALESCE(updated_by, created_by),
    updated_at = COALESCE(updated_at, created_at)
WHERE role IN ('doctor', 'admin') AND created_by IS NOT NULL;
