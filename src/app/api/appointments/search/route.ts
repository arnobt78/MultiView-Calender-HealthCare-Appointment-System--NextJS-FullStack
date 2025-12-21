import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { PAGINATION, VALIDATION } from "@/lib/constants";

// GET /api/appointments/search?query=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || PAGINATION.DEFAULT_LIMIT.toString());
    
    // Validate search query length
    if (searchQuery.length < VALIDATION.MIN_SEARCH_QUERY_LENGTH) {
      return NextResponse.json({ 
        error: `Search query must be at least ${VALIDATION.MIN_SEARCH_QUERY_LENGTH} characters` 
      }, { status: 400 });
    }
    
    if (searchQuery.length > VALIDATION.MAX_SEARCH_QUERY_LENGTH) {
      return NextResponse.json({ 
        error: `Search query too long (max ${VALIDATION.MAX_SEARCH_QUERY_LENGTH} characters)` 
      }, { status: 400 });
    }
    
    // Get current user from session
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Search appointments by title or id, but only for this user
    const safeLimit = Math.min(Math.max(limit, 1), PAGINATION.MAX_SEARCH_LIMIT);
    
    let result;
    if (isValidUUID(searchQuery)) {
      // Search by ID (exact match)
      result = await query(
        `SELECT id, title, "start", "end", status FROM appointments 
         WHERE user_id = $1 AND id = $2 
         LIMIT $3`,
        [sessionUser.userId, searchQuery, safeLimit]
      );
    } else {
      // Search by title (case-insensitive, partial match)
      // Use trigram index if available for better performance on large datasets
      result = await query(
        `SELECT id, title, "start", "end", status FROM appointments 
         WHERE user_id = $1 AND title ILIKE $2 
         ORDER BY "start" DESC
         LIMIT $3`,
        [sessionUser.userId, `%${searchQuery}%`, safeLimit]
      );
    }
    
    return NextResponse.json({ 
      appointments: result.rows,
      count: result.rows.length,
      limit: safeLimit
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 });
  }
}
