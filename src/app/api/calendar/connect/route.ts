/**
 * Google Calendar Connect — OAuth flow for calendar sync
 *
 * GET /api/calendar/connect → sets signed httpOnly cookie, redirects to Google with
 * `state` = random nonce (not user id). Callback verifies nonce against cookie.
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getGoogleAuthUrl } from "@/lib/google-calendar";
import {
  createCalendarOAuthState,
  GCAL_OAUTH_COOKIE_NAME,
  oauthStateCookieOptions,
} from "@/lib/oauth-state";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { googleState, cookieValue } = createCalendarOAuthState(sessionUser.userId);
    const authUrl = getGoogleAuthUrl(googleState);
    const res = NextResponse.redirect(authUrl);
    res.cookies.set(GCAL_OAUTH_COOKIE_NAME, cookieValue, oauthStateCookieOptions());
    return res;
  } catch (error: unknown) {
    console.error("Google Calendar connect error:", error);
    return NextResponse.json({ error: "Failed to initiate connection" }, { status: 500 });
  }
}
