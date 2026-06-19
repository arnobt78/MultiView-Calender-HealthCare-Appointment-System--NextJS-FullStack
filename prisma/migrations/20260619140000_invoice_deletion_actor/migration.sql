-- REQ-0114: frozen actor when visit detached or invoice soft-deleted.
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "visit_detached_by_id" UUID;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "visit_detached_by_display" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "visit_detached_by_email" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "visit_detached_by_image" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "visit_detached_by_role" TEXT;

ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ(6);
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "deleted_by_id" UUID;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "deleted_by_display" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "deleted_by_email" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "deleted_by_image" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "deleted_by_role" TEXT;
