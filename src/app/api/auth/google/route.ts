/**
 * Google OAuth - Redirect to Google consent screen
 * GET /api/auth/google
 */

import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;

export async function GET(req: NextRequest) {
  if (!GOOGLE_CLIENT_ID) {
    console.error("GOOGLE_ID or GOOGLE_CLIENT_ID is not set");
    return NextResponse.redirect(new URL("/login?error=Google+OAuth+not+configured", req.url));
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  const scope = "openid email profile";
  const state = req.nextUrl.searchParams.get("redirect") || "/dashboard";

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    state,
    access_type: "offline",
    prompt: "consent",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(googleAuthUrl);
}
