/**
 * Email Verification API Route
 * 
 * Handles email verification via token.
 * Replaces Supabase Auth email verification.
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";
import { updateEmailVerification } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", req.url)
      );
    }

    // Find user by verification token
    const result = await query(
      "SELECT id, email FROM users WHERE email_verification_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", req.url)
      );
    }

    const user = result.rows[0];

    // Update user to verified
    await updateEmailVerification(user.id, true);

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL("/login?verified=1", req.url)
    );
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.redirect(
      new URL("/login?error=verification_failed", req.url)
    );
  }
}

