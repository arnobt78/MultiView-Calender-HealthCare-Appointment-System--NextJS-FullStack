/**
 * Appointment by ID API Route Handler
 * 
 * This file implements RESTful API endpoints for individual appointment operations:
 * - GET: Retrieve a specific appointment by ID
 * - PUT: Full update (replace entire appointment)
 * - PATCH: Partial update (update only provided fields)
 * - DELETE: Remove an appointment
 * 
 * The [id] in the filename is a Next.js dynamic route parameter.
 * Example: /api/appointments/123-abc-456
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

// TypeScript interface matching the database schema
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
 * GET /api/appointments/[id]
 * 
 * Retrieves a single appointment by its ID.
 * 
 * Route Parameters:
 * - id: UUID of the appointment to retrieve
 * 
 * @param req - Next.js request object
 * @param context - Contains route parameters (id from URL)
 * @returns JSON response with appointment data or 404 error
 */
export async function GET(req: NextRequest, context: any) {
  // Extract appointment ID from URL parameters
  // Example: /api/appointments/abc123 -> id = "abc123"
  const { id } = context.params;
  
  // Query database for appointment with matching ID
  // .single() expects exactly one result, throws error if 0 or multiple results
  const { data, error } = await supabaseAdmin.from("appointments").select("*").eq("id", id).single();
  
  if (error) {
    // Return 404 if appointment not found or query failed
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  
  return NextResponse.json({ appointment: data });
}

/**
 * PUT /api/appointments/[id]
 * 
 * Performs a FULL update (replace) of an appointment.
 * All fields must be provided, even if unchanged.
 * 
 * Use PUT when you want to replace the entire resource.
 * 
 * @param req - Request body should contain all appointment fields
 * @param context - Contains route parameter (id)
 * @returns Updated appointment or error
 */
export async function PUT(req: NextRequest, context: any) {
  const { id } = context.params;
  try {
    const body = await req.json();
    // Update all fields - body should contain complete appointment object
    // .select() returns the updated record
    const { data, error } = await supabaseAdmin.from("appointments").update(body).eq("id", id).select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ appointment: data[0] });
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/appointments/[id]
 * 
 * Performs a PARTIAL update of an appointment.
 * Only provided fields will be updated, others remain unchanged.
 * 
 * Use PATCH when you only want to update specific fields.
 * This is more efficient and flexible than PUT.
 * 
 * @param req - Request body contains only fields to update
 * @param context - Contains route parameter (id)
 * @returns Updated appointment or error
 */
export async function PATCH(req: NextRequest, context: any) {
  const { id } = context.params;
  try {
    const body = await req.json();
    // Partial update - only fields in body are updated
    // .select() returns the updated record
    const { data, error } = await supabaseAdmin.from("appointments").update(body).eq("id", id).select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ appointment: data[0] });
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/appointments/[id]
 * 
 * Permanently deletes an appointment from the database.
 * 
 * ⚠️ Warning: This operation is irreversible.
 * Consider implementing soft deletes (mark as deleted) for production.
 * 
 * @param req - Next.js request object
 * @param context - Contains route parameter (id)
 * @returns Success confirmation or error
 */
export async function DELETE(req: NextRequest, context: any) {
  const { id } = context.params;
  // Delete appointment with matching ID
  // No .select() needed since we're not returning data
  const { error } = await supabaseAdmin.from("appointments").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
