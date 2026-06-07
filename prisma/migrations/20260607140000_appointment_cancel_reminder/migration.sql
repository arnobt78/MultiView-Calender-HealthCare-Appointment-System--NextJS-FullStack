-- Appointment cancel audit + reminder dedupe columns
ALTER TABLE "appointments"
  ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "cancelled_by_id" UUID,
  ADD COLUMN IF NOT EXISTS "reminder_sent_at" TIMESTAMPTZ(6);

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_cancelled_by_id_fkey"
  FOREIGN KEY ("cancelled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "appointments_reminder_sent_at_idx" ON "appointments" ("reminder_sent_at");
