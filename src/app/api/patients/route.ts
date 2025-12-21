/**
 * Patients API Route Handler
 * 
 * This file implements RESTful API endpoints for patient management:
 * - GET: Retrieve all patients (for authenticated users)
 * 
 * Uses PostgreSQL directly via postgresClient for database operations.
 * All operations require authentication via getSessionUser().
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";
import { getSessionUser } from "@/lib/session";

/**
 * GET /api/patients
 * 
 * Retrieves all patients from the database.
 * 
 * @param req - Next.js request object
 * @returns JSON response with patients array or error message
 */
export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query all patients (in a real app, you might want to filter by user)
    const result = await query(
      `SELECT * FROM patients ORDER BY created_at DESC`
    );

    return NextResponse.json({ patients: result.rows || [] });
  } catch (error: any) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

