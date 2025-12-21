/**
 * Appointment Assignees API Route Handler
 * 
 * This file implements RESTful API endpoints for appointment assignee management:
 * - GET: Retrieve all appointment assignees (for authenticated users)
 * 
 * Uses PostgreSQL directly via postgresClient for database operations.
 * All operations require authentication via getSessionUser().
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";
import { getSessionUser } from "@/lib/session";

/**
 * GET /api/appointment-assignees
 * 
 * Retrieves all appointment assignees from the database.
 * Supports optional query parameter filtering by appointment_id.
 * 
 * Query Parameters:
 * - appointment_id (optional): Filter assignees by appointment
 * 
 * @param req - Next.js request object containing query parameters
 * @returns JSON response with assignees array or error message
 */
export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointment_id");

    let sqlQuery = "SELECT * FROM appointment_assignee";
    const params: any[] = [];
    
    if (appointmentId) {
      sqlQuery += " WHERE appointment = $1";
      params.push(appointmentId);
    }
    
    sqlQuery += " ORDER BY created_at DESC";

    const result = await query(sqlQuery, params);

    return NextResponse.json({ assignees: result.rows || [] });
  } catch (error: any) {
    console.error("Error fetching appointment assignees:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

