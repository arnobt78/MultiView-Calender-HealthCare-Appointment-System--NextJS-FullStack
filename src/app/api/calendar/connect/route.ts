/**
 * Google Calendar Connect — OAuth flow for calendar sync
 * 
 * GET /api/calendar/connect → redirects to Google OAuth with calendar scope
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getGoogleAuthUrl } from "@/lib/google-calendar";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUrl = getGoogleAuthUrl(sessionUser.userId);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Google Calendar connect error:", error);
    return NextResponse.json({ error: "Failed to initiate connection" }, { status: 500 });
  }
}
