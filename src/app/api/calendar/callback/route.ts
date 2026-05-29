/**
 * Google Calendar OAuth Callback
 *
 * GET /api/calendar/callback?code=...&state=<nonce>
 * Verifies `state` against the signed httpOnly cookie (binds tokens to the user who
 * started the flow), exchanges the code, then clears the cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens } from "@/lib/google-calendar";
import {
  GCAL_OAUTH_COOKIE_NAME,
  verifyCalendarOAuthState,
  oauthStateCookieOptions,
} from "@/lib/oauth-state";

function clearGcalCookie(res: NextResponse) {
  res.cookies.set(GCAL_OAUTH_COOKIE_NAME, "", { ...oauthStateCookieOptions(), maxAge: 0 });
}

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const cookieVal = request.cookies.get(GCAL_OAUTH_COOKIE_NAME)?.value;

    const verified = verifyCalendarOAuthState(state, cookieVal);
    if (!code || !verified) {
      const res = NextResponse.redirect(
        new URL("/control-panel?error=missing_code_or_invalid_state", request.url)
      );
      clearGcalCookie(res);
      return res;
    }

    const tokens = await exchangeCodeForTokens(code);

    await prisma.googleCalendarToken.upsert({
      where: { user_id: verified.userId },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || undefined,
        expiry_date: new Date(tokens.expiry_date),
        updated_at: new Date(),
      },
      create: {
        user_id: verified.userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expiry_date: new Date(tokens.expiry_date),
        calendar_id: "primary",
      },
    });

    const res = NextResponse.redirect(new URL("/?gcal=connected", request.url));
    clearGcalCookie(res);
    return res;
  } catch (error: unknown) {
    console.error("Google Calendar callback error:", error);
    const res = NextResponse.redirect(new URL("/control-panel?error=gcal_failed", request.url));
    clearGcalCookie(res);
    return res;
  }
}
