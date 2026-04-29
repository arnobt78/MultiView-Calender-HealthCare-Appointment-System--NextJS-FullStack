-- Migration: Add availability + range indexes for slot computation
-- Created: April 29, 2026

-- Weekly windows lookup by doctor + weekday
CREATE INDEX IF NOT EXISTS idx_doctor_availability_user_weekday
  ON doctor_availability(user_id, weekday);

-- Time-off overlap filtering by doctor + start
CREATE INDEX IF NOT EXISTS idx_doctor_time_off_user_starts_at
  ON doctor_time_off(user_id, starts_at);

-- Slot computation overlap scan on doctor appointments
CREATE INDEX IF NOT EXISTS idx_appointments_user_start_end
  ON appointments(user_id, "start", "end");
