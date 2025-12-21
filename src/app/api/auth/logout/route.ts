/**
 * Logout API Route
 * 
 * Handles user logout by clearing session.
 * Replaces Supabase Auth logout functionality.
 */

import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST() {
  try {
    // Clear session cookie
    await clearSession();

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

