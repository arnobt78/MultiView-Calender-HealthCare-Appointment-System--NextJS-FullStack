-- One active invoice per visit (draft/sent/overdue/paid). Cancelled/refunded frees the appointment for rebill.
CREATE UNIQUE INDEX IF NOT EXISTS invoices_one_active_per_appointment
ON invoices (appointment_id)
WHERE appointment_id IS NOT NULL
  AND status IN ('draft', 'sent', 'overdue', 'paid');
