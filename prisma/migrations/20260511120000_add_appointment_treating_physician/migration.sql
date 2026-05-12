-- B2: optional treating / referring physician (`treating_physician_id` → `users.id`).
-- Backfill from calendar owner so existing rows behave like pre-B2 semantics until staff edits.

ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "treating_physician_id" UUID;

UPDATE "appointments" SET "treating_physician_id" = "user_id" WHERE "treating_physician_id" IS NULL;

CREATE INDEX IF NOT EXISTS "appointments_treating_physician_id_idx" ON "appointments"("treating_physician_id");

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_treating_physician_id_fkey"
  FOREIGN KEY ("treating_physician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
