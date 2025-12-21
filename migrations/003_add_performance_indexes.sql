-- Migration: Add Performance Indexes
-- Created: December 21, 2025
-- Description: Adds additional indexes for better query performance and scalability

-- Index on users.email for fast login lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index on users.email_verification_token for fast verification lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);

-- Index on users.password_reset_token for fast password reset lookups
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

-- Composite index for appointment queries filtered by user and date range
CREATE INDEX IF NOT EXISTS idx_appointments_user_start ON appointments(user_id, "start");

-- Index on appointments.status for filtering by status
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status) WHERE status IS NOT NULL;

-- Index on appointments.category for filtering by category
CREATE INDEX IF NOT EXISTS idx_appointments_category ON appointments(category) WHERE category IS NOT NULL;

-- Composite index for appointment_assignee queries (common pattern)
CREATE INDEX IF NOT EXISTS idx_appointment_assignee_user_status ON appointment_assignee("user", status);

-- Index on appointment_assignee.invited_email for email-based lookups
CREATE INDEX IF NOT EXISTS idx_appointment_assignee_invited_email ON appointment_assignee(invited_email) WHERE invited_email IS NOT NULL;

-- Index on dashboard_access.invited_email for email-based lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_access_invited_email ON dashboard_access(invited_email) WHERE invited_email IS NOT NULL;

-- Composite index for dashboard_access queries
CREATE INDEX IF NOT EXISTS idx_dashboard_access_user_status ON dashboard_access(invited_user_id, status);

