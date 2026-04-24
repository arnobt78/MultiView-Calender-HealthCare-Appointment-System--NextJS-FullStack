/**
 * Google OAuth callback - Exchange code for tokens, get user info, create/update user, set session
 * GET /api/auth/callback/google
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  createUserFromGoogle,
  updateUserProfile,
  updateEmailVerification,
  generateToken,
} from "@/lib/auth";
import { setSession } from "@/lib/session";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state") || "/dashboard";
  const errorParam = req.nextUrl.searchParams.get("error");

  if (errorParam) {
    const errorDesc = req.nextUrl.searchParams.get("error_description") || errorParam;
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorDesc)}`, req.url));
  }

  if (!code || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL("/login?error=Missing+code+or+Google+OAuth+config", req.url)
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Google token error:", err);
      return NextResponse.redirect(
        new URL("/login?error=Google+token+exchange+failed", req.url)
      );
    }

    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    // Get user info
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(
        new URL("/login?error=Failed+to+get+Google+profile", req.url)
      );
    }

    const profile = (await userInfoRes.json()) as GoogleUserInfo;

    if (!profile.email) {
      return NextResponse.redirect(
        new URL("/login?error=Google+account+has+no+email", req.url)
      );
    }

    type SessionUser = { id: string; email: string; display_name?: string | null; image?: string | null };
    let user: SessionUser | null = await getUserByEmail(profile.email);

    if (!user) {
      user = await createUserFromGoogle(
        profile.email,
        profile.name ?? null,
        profile.picture ?? null
      );
    } else {
      // Update profile and mark email verified (Google verified the email)
      await updateUserProfile(user.id, {
        display_name: profile.name ?? user.display_name,
        image: profile.picture ?? user.image,
      });
      await updateEmailVerification(user.id, true);
      // Refetch to get updated image/display_name/email_verified
      user = await getUserByEmail(profile.email);
    }

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=Could+not+create+session", req.url));
    }

    const token = generateToken(user.id, user.email);
    await setSession(token);

    const redirectTo = state.startsWith("/") ? state : "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(
      new URL("/login?error=Google+sign-in+failed", req.url)
    );
  }
}
