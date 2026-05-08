/**
 * Google Calendar OAuth Callback
 * 
 * GET /api/calendar/callback?code=...&state=userId
 * Exchanges the code for tokens and stores them in the database.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const userId = searchParams.get("state");

    if (!code || !userId) {
      return NextResponse.redirect(new URL("/control-panel?error=missing_code", request.url));
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Store tokens in database (upsert)
    await prisma.googleCalendarToken.upsert({
      where: { user_id: userId },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || undefined,
        expiry_date: new Date(tokens.expiry_date),
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expiry_date: new Date(tokens.expiry_date),
        calendar_id: "primary",
      },
    });

    // Redirect back to dashboard with success
    return NextResponse.redirect(new URL("/?gcal=connected", request.url));
  } catch (error: unknown) {
    console.error("Google Calendar callback error:", error);
    return NextResponse.redirect(new URL("/control-panel?error=gcal_failed", request.url));
  }
}
