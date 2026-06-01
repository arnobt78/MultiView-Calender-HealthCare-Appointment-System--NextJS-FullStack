-- One active invoice per visit. Dedupe legacy rows first (keeps newest blocking invoice per appointment).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY appointment_id
      ORDER BY created_at DESC, id DESC
    ) AS rn
  FROM invoices
  WHERE appointment_id IS NOT NULL
    AND status IN ('draft', 'sent', 'overdue', 'paid')
)
UPDATE invoices AS inv
SET status = 'cancelled'
FROM ranked AS r
WHERE inv.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS invoices_one_active_per_appointment
ON invoices (appointment_id)
WHERE appointment_id IS NOT NULL
  AND status IN ('draft', 'sent', 'overdue', 'paid');
