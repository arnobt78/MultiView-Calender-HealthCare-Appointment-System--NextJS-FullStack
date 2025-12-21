/**
 * Categories API Route Handler
 * 
 * This file implements RESTful API endpoints for category management:
 * - GET: Retrieve all categories (for authenticated users)
 * 
 * Uses PostgreSQL directly via postgresClient for database operations.
 * All operations require authentication via getSessionUser().
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";
import { getSessionUser } from "@/lib/session";

/**
 * GET /api/categories
 * 
 * Retrieves all categories from the database.
 * 
 * @param req - Next.js request object
 * @returns JSON response with categories array or error message
 */
export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query all categories
    const result = await query(
      `SELECT * FROM categories ORDER BY created_at DESC`
    );

    return NextResponse.json({ categories: result.rows || [] });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

