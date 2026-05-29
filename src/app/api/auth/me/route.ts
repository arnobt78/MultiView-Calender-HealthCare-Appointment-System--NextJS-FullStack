/**
 * Get Current User API Route
 * 
 * Returns the currently authenticated user from session.
 * Replaces Supabase Auth getUser functionality.
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserById } from "@/lib/auth";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get user from session
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get full user data from database
    const user = await getUserById(sessionUser.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user data (without sensitive information)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        email_verified: user.email_verified,
        image: user.image ?? null,
      },
    });
  } catch (error: unknown) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

