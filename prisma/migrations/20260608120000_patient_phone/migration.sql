-- Patient contact phone for SMS reminders and detail display
ALTER TABLE "patients"
  ADD COLUMN IF NOT EXISTS "phone" TEXT;
