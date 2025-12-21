/**
 * Supabase Client Configuration
 * 
 * This file creates and exports a Supabase client for client-side operations.
 * This client uses the anonymous (public) key and respects Row Level Security (RLS) policies.
 * 
 * Use this client in:
 * - Client components ("use client")
 * - Browser-side operations
 * - Operations that should respect RLS policies
 * 
 * For server-side operations that need to bypass RLS, use supabaseAdmin instead.
 */

import { createClient } from "@supabase/supabase-js";

// Get Supabase configuration from environment variables
// NEXT_PUBLIC_ prefix makes these available in the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create and export the Supabase client
// This client will be used throughout the application for client-side database operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
