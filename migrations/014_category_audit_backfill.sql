-- Backfill category audit FKs for rows seeded before created_by / updated_by were set
UPDATE categories c
SET created_by = u.id
FROM users u
WHERE c.created_by IS NULL
  AND u.email = 'test@admin.com';

UPDATE categories
SET updated_by = COALESCE(updated_by, created_by),
    updated_at = COALESCE(updated_at, created_at)
WHERE updated_by IS NULL AND created_by IS NOT NULL;
