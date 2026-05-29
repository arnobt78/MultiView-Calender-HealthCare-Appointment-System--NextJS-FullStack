/**
 * Google OAuth - Redirect to Google consent screen
 * GET /api/auth/google
 *
 * Sets a signed httpOnly cookie and sends a random nonce as OAuth `state` so the
 * callback can prove the response matches this browser's authorization request (CSRF).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createGoogleLoginOAuthState,
  GOOGLE_LOGIN_OAUTH_COOKIE_NAME,
  oauthStateCookieOptions,
} from "@/lib/oauth-state";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!GOOGLE_CLIENT_ID) {
    console.error("GOOGLE_ID or GOOGLE_CLIENT_ID is not set");
    return NextResponse.redirect(new URL("/login?error=Google+OAuth+not+configured", req.url));
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  const scope = "openid email profile";

  const rawRedirect = req.nextUrl.searchParams.get("redirect") || "/dashboard";
  const isSafePath = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//");
  const safeRedirect = isSafePath ? rawRedirect : "/dashboard";

  const { googleState, cookieValue } = createGoogleLoginOAuthState(safeRedirect);

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    state: googleState,
    access_type: "offline",
    prompt: "consent",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  const res = NextResponse.redirect(googleAuthUrl);
  res.cookies.set(GOOGLE_LOGIN_OAUTH_COOKIE_NAME, cookieValue, oauthStateCookieOptions());
  return res;
}
