-- Add google_calendar_event_id for upsert sync to Google Calendar (C36.1)
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "google_calendar_event_id" TEXT;
