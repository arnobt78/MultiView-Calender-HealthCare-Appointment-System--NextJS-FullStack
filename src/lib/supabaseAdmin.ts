/**
 * Supabase Admin Client Configuration
 * 
 * This file creates and exports a Supabase admin client for server-side operations.
 * This client uses the service role key and BYPASSES Row Level Security (RLS) policies.
 * 
 * ⚠️ SECURITY WARNING:
 * - NEVER use this client in client-side code (browser)
 * - NEVER expose the service role key to the frontend
 * - Only use in API routes, server components, and server-side functions
 * 
 * Use this client when you need:
 * - Full database access without RLS restrictions
 * - Server-side operations that require elevated permissions
 * - Admin operations in API routes
 */

import { createClient } from "@supabase/supabase-js";

// Get Supabase URL (public, safe to expose)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Get service role key (PRIVATE - must never be exposed to client)
// This key has admin privileges and bypasses all RLS policies
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate that service role key is configured
// Fail fast if missing to prevent runtime errors
if (!supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is missing. Please set it in your .env.local file."
  );
}

// Create admin client with service role key
// This client bypasses RLS and has full database access
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
