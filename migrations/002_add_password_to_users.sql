-- Migration: Add password field to users table for custom authentication
-- Created: December 21, 2025
-- Description: Adds password_hash and email_verified fields to support custom auth

-- Add password_hash column (nullable for existing users, required for new registrations)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add email_verified column (replaces Supabase's email_confirmed_at)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add email_verification_token column for email verification
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token UUID;

-- Add password_reset_token column for password reset
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token UUID;

-- Add password_reset_expires column for password reset expiration
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE;

-- Create index on email_verification_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);

-- Create index on password_reset_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

