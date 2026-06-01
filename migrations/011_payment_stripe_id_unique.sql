-- Prevent duplicate Payment rows for the same Stripe reference (webhook + manual retries).
-- Drop extras first so existing dev DBs with webhook retries can apply the index.
DELETE FROM payments p
USING payments p2
WHERE p.stripe_payment_id IS NOT NULL
  AND p.stripe_payment_id = p2.stripe_payment_id
  AND p.id > p2.id;

CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_payment_id_unique
ON payments (stripe_payment_id)
WHERE stripe_payment_id IS NOT NULL;
