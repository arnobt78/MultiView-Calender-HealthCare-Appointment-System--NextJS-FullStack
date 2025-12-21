import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";
import { getSessionUser } from "@/lib/session";
import { PAGINATION, VALIDATION } from "@/lib/constants";

// GET /api/users/search?query=...
// Search users by email or display_name (for invitations)
// Requires authentication to prevent user enumeration
export async function GET(req: NextRequest) {
  try {
    // Require authentication to prevent user enumeration attacks
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || PAGINATION.DEFAULT_LIMIT.toString());
    
    // Validate search query
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
    
    // Check if search query is a UUID (for direct user lookup by ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchQuery);
    
    // Limit results for performance and privacy
    const safeLimit = Math.min(Math.max(limit, 1), PAGINATION.MAX_SEARCH_LIMIT);
    
    let result;
    if (isUUID) {
      // Direct lookup by UUID (for fetching owner users by ID)
      result = await query(
        `SELECT id, email, display_name FROM users 
         WHERE id = $1 AND email_verified = true`,
        [searchQuery]
      );
    } else {
      // Search users by email or display_name (case-insensitive)
      // Only return basic info (id, email, display_name) for privacy
      result = await query(
        `SELECT id, email, display_name FROM users 
         WHERE (email ILIKE $1 OR display_name ILIKE $1)
         AND email_verified = true
         ORDER BY display_name NULLS LAST, email
         LIMIT $2`,
        [`%${searchQuery}%`, safeLimit]
      );
    }
    
    return NextResponse.json({ 
      users: result.rows,
      count: result.rows.length,
      limit: safeLimit
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
