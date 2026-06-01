-- Prevent duplicate Payment rows for the same Stripe reference (webhook + manual retries).
CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_payment_id_unique
ON payments (stripe_payment_id)
WHERE stripe_payment_id IS NOT NULL;
