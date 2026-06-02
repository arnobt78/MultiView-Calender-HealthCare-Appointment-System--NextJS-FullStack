-- Add per-appointment-type visit fee (in cents).
-- Falls back to the treating doctor's consultation_fee when 0 in billing-auto-draft logic.
ALTER TABLE appointment_types ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 0;
