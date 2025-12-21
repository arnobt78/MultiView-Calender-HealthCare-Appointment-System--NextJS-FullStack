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

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";

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
  try {
    // Extract appointment ID from URL parameters
    // Example: /api/appointments/abc123 -> id = "abc123"
    // Next.js 15: params must be awaited
    const { id } = await context.params;
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }
    
    // Optional: Check authentication for private appointments
    // For now, allow public access (for invitation links)
    // If you want to restrict, uncomment below:
    /*
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */
    
    // Query database for appointment with matching ID
    const result = await query(
      `SELECT * FROM appointments WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      // Return 404 if appointment not found
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    
    return NextResponse.json({ appointment: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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
    // Get authenticated user
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Update all fields - body should contain complete appointment object
    const result = await query(
      `UPDATE appointments 
       SET title = $1, "start" = $2, "end" = $3, location = $4, patient = $5, 
           attachements = $6, category = $7, notes = $8, status = $9, updated_at = NOW()
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [
        body.title,
        body.start,
        body.end,
        body.location || null,
        body.patient || null,
        body.attachements || null,
        body.category || null,
        body.notes || null,
        body.status || null,
        id,
        sessionUser.userId,
      ]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }
    
    return NextResponse.json({ appointment: result.rows[0] });
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
    // Get authenticated user
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Build dynamic UPDATE query for partial update
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    // Only update fields that are provided in the body
    if (body.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }
    if (body.start !== undefined) {
      updateFields.push(`"start" = $${paramIndex++}`);
      values.push(body.start);
    }
    if (body.end !== undefined) {
      updateFields.push(`"end" = $${paramIndex++}`);
      values.push(body.end);
    }
    if (body.location !== undefined) {
      updateFields.push(`location = $${paramIndex++}`);
      values.push(body.location);
    }
    if (body.patient !== undefined) {
      updateFields.push(`patient = $${paramIndex++}`);
      values.push(body.patient);
    }
    if (body.attachements !== undefined) {
      updateFields.push(`attachements = $${paramIndex++}`);
      values.push(body.attachements);
    }
    if (body.category !== undefined) {
      updateFields.push(`category = $${paramIndex++}`);
      values.push(body.category);
    }
    if (body.notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      values.push(body.notes);
    }
    if (body.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(body.status);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    
    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);
    
    // Add WHERE clause with id and user_id for security
    values.push(id, sessionUser.userId);
    
    const result = await query(
      `UPDATE appointments 
       SET ${updateFields.join(", ")}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }
    
    return NextResponse.json({ appointment: result.rows[0] });
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
  try {
    // Get authenticated user
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Delete appointment with matching ID and user_id (security check)
    const result = await query(
      `DELETE FROM appointments WHERE id = $1 AND user_id = $2`,
      [id, sessionUser.userId]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
