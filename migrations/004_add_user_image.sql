-- Migration: Add profile image and Google OAuth support to users table
-- Description: Adds image column for profile picture (from OAuth or Robohash fallback)

ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;
