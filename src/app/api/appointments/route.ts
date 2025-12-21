/**
 * Appointments API Route Handler
 * 
 * This file implements RESTful API endpoints for appointment management:
 * - GET: Retrieve appointments (with optional filtering)
 * - POST: Create new appointments
 * 
 * Uses Supabase Admin client for database operations, which bypasses Row Level Security (RLS)
 * for server-side operations. This is appropriate for API routes that need full database access.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

// TypeScript interface defining the structure of an Appointment object
// All fields match the database schema in Supabase
type Appointment = {
  id: string;
  created_at: string;
  updated_at?: string | null;
  start: string;
  end: string;
  location?: string | null;
  patient?: string | null;
  attachements?: string[] | null;
  category?: string | null;
  notes?: string | null;
  title: string;
  status?: string;
  user_id: string;
};

/**
 * GET /api/appointments
 * 
 * Retrieves all appointments from the database.
 * Supports optional query parameter filtering by user_id.
 * 
 * Query Parameters:
 * - user_id (optional): Filter appointments by specific user
 * 
 * @param req - Next.js request object containing query parameters
 * @returns JSON response with appointments array or error message
 */
export async function GET(req: NextRequest) {
  // Extract query parameters from the request URL
  // Example: /api/appointments?user_id=123
  const { searchParams } = new URL(req.url);
  
  // Optional filtering: Get user_id from query parameters if provided
  const userId = searchParams.get("user_id");
  
  // Build Supabase query - start with selecting all appointments
  let query = supabaseAdmin.from("appointments").select("*");
  
  // Apply filter if user_id is provided
  // This allows fetching appointments for a specific user
  if (userId) {
    query = query.eq("user_id", userId);
  }
  
  // Execute the query
  const { data, error } = await query;
  
  // Handle database errors
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Return successful response with appointments data
  return NextResponse.json({ appointments: data });
}

/**
 * POST /api/appointments
 * 
 * Creates a new appointment in the database.
 * Validates required fields before insertion.
 * 
 * Request Body (required fields):
 * - title: Appointment title/name
 * - start: Start date/time (ISO 8601 format)
 * - end: End date/time (ISO 8601 format)
 * - user_id: ID of the user creating the appointment
 * 
 * Optional fields: location, patient, attachements, category, notes, status
 * 
 * @param req - Next.js request object containing appointment data in body
 * @returns JSON response with created appointment or error message
 */
export async function POST(req: NextRequest) {
  try {
    // Parse JSON body from request
    const body = await req.json();
    
    // Input validation: Check that all required fields are present
    // This prevents incomplete data from being saved to the database
    if (!body.title || !body.start || !body.end || !body.user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Insert new appointment into database
    // Using array syntax [body] because Supabase insert expects an array
    const { data, error } = await supabaseAdmin.from("appointments").insert([body]);
    
    // Handle database errors (e.g., constraint violations, connection issues)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Type assertion and validation: Ensure data was returned
    const appointments = data as Appointment[] | null;
    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ error: "Appointment not found or could not be created." }, { status: 404 });
    }
    
    // Return the newly created appointment (first item in array)
    return NextResponse.json({ appointment: appointments[0] });
  } catch (err: unknown) {
    // Error handling for JSON parsing errors or other unexpected errors
    // Type-safe error message extraction
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ...existing code...

