/**
 * Dashboard Access API Route Handler
 * 
 * This file implements RESTful API endpoints for dashboard access management:
 * - GET: Retrieve dashboard access records for the authenticated user
 * 
 * Uses PostgreSQL directly via postgresClient for database operations.
 * All operations require authentication via getSessionUser().
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";
import { getSessionUser } from "@/lib/session";

/**
 * GET /api/dashboard-access
 * 
 * Retrieves dashboard access records where the user is the owner, invited user, or invited by email.
 * Supports optional query parameter filtering by status.
 * 
 * Query Parameters:
 * - status (optional): Filter by status (pending, accepted, declined)
 * 
 * @param req - Next.js request object containing query parameters
 * @returns JSON response with dashboard access records array or error message
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
    const status = searchParams.get("status");

    // Build query to get dashboard access where user is owner, invited user, or invited by email
    let sqlQuery = `
      SELECT * FROM dashboard_access 
      WHERE owner_user_id = $1 
         OR invited_user_id = $1 
         OR invited_email = $2
    `;
    const params: any[] = [sessionUser.userId, sessionUser.email];
    
    if (status) {
      sqlQuery += ` AND status = $3`;
      params.push(status);
    }
    
    sqlQuery += ` ORDER BY created_at DESC`;

    const result = await query(sqlQuery, params);

    return NextResponse.json({ dashboard_access: result.rows || [] });
  } catch (error: any) {
    console.error("Error fetching dashboard access:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

