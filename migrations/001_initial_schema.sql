-- Database Schema for Multiview Calendar Appointment System
-- Migration: 001_initial_schema.sql
-- Created: December 21, 2025
-- Description: Creates all required tables for the calendar appointment system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced from auth system)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  birth_date DATE,
  care_level INTEGER,
  pronoun TEXT,
  email TEXT,
  active BOOLEAN DEFAULT true,
  active_since TIMESTAMP WITH TIME ZONE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  label TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT
);

-- Relatives table
CREATE TABLE IF NOT EXISTS relatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  pronoun TEXT,
  notes TEXT
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  "start" TIMESTAMP WITH TIME ZONE NOT NULL,
  "end" TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  patient UUID REFERENCES patients(id) ON DELETE SET NULL,
  attachements TEXT[],
  category UUID REFERENCES categories(id) ON DELETE SET NULL,
  notes TEXT,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('done', 'pending', 'alert')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

-- Appointment Assignee table (invitations and permissions)
CREATE TABLE IF NOT EXISTS appointment_assignee (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  appointment UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  "user" UUID REFERENCES users(id) ON DELETE SET NULL,
  user_type TEXT CHECK (user_type IN ('relatives', 'patients')),
  invited_email TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')),
  invitation_token UUID UNIQUE,
  permission TEXT CHECK (permission IN ('read', 'write', 'full')),
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Activities table (appointment activity log)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  appointment UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL
);

-- Dashboard Access table (dashboard sharing permissions)
CREATE TABLE IF NOT EXISTS dashboard_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  invited_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_email TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')),
  invitation_token UUID UNIQUE,
  permission TEXT CHECK (permission IN ('read', 'write', 'full')),
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments("start");
CREATE INDEX IF NOT EXISTS idx_appointments_end ON appointments("end");
CREATE INDEX IF NOT EXISTS idx_appointment_assignee_appointment ON appointment_assignee(appointment);
CREATE INDEX IF NOT EXISTS idx_appointment_assignee_user ON appointment_assignee("user");
CREATE INDEX IF NOT EXISTS idx_appointment_assignee_token ON appointment_assignee(invitation_token);
CREATE INDEX IF NOT EXISTS idx_activities_appointment ON activities(appointment);
CREATE INDEX IF NOT EXISTS idx_dashboard_access_owner ON dashboard_access(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_access_invited ON dashboard_access(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_access_token ON dashboard_access(invitation_token);

-- Grant permissions to the database user
-- Note: Replace 'multiview_calendar_user' with your actual database user name
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO multiview_calendar_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO multiview_calendar_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO multiview_calendar_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO multiview_calendar_user;

