-- Allow appointment status 'cancelled' (matches app validation + cancel PATCH).
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_status_check";

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_status_check"
  CHECK (
    "status" IS NULL
    OR "status" IN ('done', 'pending', 'alert', 'cancelled')
  );
