/**
 * Appointments API Route Handler
 * 
 * This file implements RESTful API endpoints for appointment management:
 * - GET: Retrieve appointments (with optional filtering)
 * - POST: Create new appointments
 * 
 * Uses PostgreSQL directly via postgresClient for database operations.
 * All operations require authentication via getSessionUser().
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";
import { getSessionUser } from "@/lib/session";
import { PAGINATION, VALIDATION } from "@/lib/constants";

// TypeScript interface defining the structure of an Appointment object
// All fields match the database schema in PostgreSQL
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
  try {
    // Require authentication - users can only see their own appointments
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract query parameters from the request URL
    const { searchParams } = new URL(req.url);
    
    // Get optional filters
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const limit = parseInt(searchParams.get("limit") || PAGINATION.DEFAULT_LIMIT.toString());
    const offset = parseInt(searchParams.get("offset") || PAGINATION.DEFAULT_OFFSET.toString());
    
    // Security: Always filter by authenticated user's ID (don't trust query params)
    // Build PostgreSQL query with user filter
    let sqlQuery = "SELECT * FROM appointments WHERE user_id = $1";
    const params: any[] = [sessionUser.userId];
    let paramIndex = 2;
    
    // Apply additional filters if provided
    if (status) {
      sqlQuery += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (category) {
      sqlQuery += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    
    if (startDate) {
      sqlQuery += ` AND "start" >= $${paramIndex++}`;
      params.push(startDate);
    }
    
    if (endDate) {
      sqlQuery += ` AND "end" <= $${paramIndex++}`;
      params.push(endDate);
    }
    
    // Order by start date (most recent first)
    sqlQuery += " ORDER BY start ASC";
    
    // Apply pagination (limit and offset)
    const safeLimit = Math.min(Math.max(limit, 1), PAGINATION.MAX_LIMIT);
    const safeOffset = Math.max(offset, PAGINATION.DEFAULT_OFFSET);
    sqlQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(safeLimit, safeOffset);
    
    // Execute the query
    const result = await query(sqlQuery, params);
    
    // Get total count for accurate pagination (run in parallel for better performance)
    const countResult = await query(
      `SELECT COUNT(*) FROM appointments WHERE user_id = $1`,
      [sessionUser.userId]
    );
    const total = parseInt(countResult.rows[0].count, 10);
    
    // Return successful response with appointments data
    return NextResponse.json({ 
      appointments: result.rows,
      pagination: {
        limit: safeLimit,
        offset: safeOffset,
        total: total,
        count: result.rows.length,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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
    // Get authenticated user
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse JSON body from request
    const body = await req.json();
    
    // Input validation: Check that all required fields are present
    // This prevents incomplete data from being saved to the database
    if (!body.title || !body.start || !body.end) {
      return NextResponse.json({ error: "Missing required fields: title, start, and end are required" }, { status: 400 });
    }
    
    // Validate title length
    if (body.title.length > VALIDATION.MAX_TITLE_LENGTH) {
      return NextResponse.json({ 
        error: `Title must be less than ${VALIDATION.MAX_TITLE_LENGTH} characters` 
      }, { status: 400 });
    }
    
    // Validate date format and logic
    const { isValidDate } = await import("@/lib/validation");
    if (!isValidDate(body.start) || !isValidDate(body.end)) {
      return NextResponse.json({ error: "Invalid date format. Use ISO 8601 format." }, { status: 400 });
    }
    
    // Validate that end is after start
    const startDate = new Date(body.start);
    const endDate = new Date(body.end);
    if (endDate <= startDate) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }
    
    // Validate status if provided
    if (body.status) {
      const { isValidAppointmentStatus } = await import("@/lib/validation");
      if (!isValidAppointmentStatus(body.status)) {
        return NextResponse.json({ error: "Invalid status. Must be 'done', 'pending', or 'alert'" }, { status: 400 });
      }
    }
    
    // Use authenticated user's ID (don't trust client-provided user_id)
    const userId = sessionUser.userId;
    
    // Insert new appointment into database
    const result = await query(
      `INSERT INTO appointments (title, "start", "end", location, patient, attachements, category, notes, status, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
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
        userId,
      ]
    );
    
    // Validate that data was returned
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found or could not be created." }, { status: 404 });
    }
    
    // Return the newly created appointment
    return NextResponse.json({ appointment: result.rows[0] });
  } catch (err: unknown) {
    // Error handling for JSON parsing errors or other unexpected errors
    // Type-safe error message extraction
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ...existing code...

