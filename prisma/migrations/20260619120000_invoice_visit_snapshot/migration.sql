-- REQ-0113: persist visit context when appointment is deleted but invoice remains.
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "visit_snapshot" JSONB;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "visit_detached_at" TIMESTAMPTZ(6);
