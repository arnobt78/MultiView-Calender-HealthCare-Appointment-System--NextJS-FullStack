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
import { resolveRoleHomeHref } from "@/lib/role-home-href";
import { getUserRole } from "@/lib/rbac";
import {
  GOOGLE_LOGIN_OAUTH_COOKIE_NAME,
  verifyGoogleLoginOAuthState,
  oauthStateCookieOptions,
} from "@/lib/oauth-state";

function clearGoogleLoginCookie(res: NextResponse) {
  res.cookies.set(GOOGLE_LOGIN_OAUTH_COOKIE_NAME, "", {
    ...oauthStateCookieOptions(),
    maxAge: 0,
  });
}

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
  const stateParam = req.nextUrl.searchParams.get("state");
  const errorParam = req.nextUrl.searchParams.get("error");
  const csrfCookie = req.cookies.get(GOOGLE_LOGIN_OAUTH_COOKIE_NAME)?.value;
  const oauthVerified = verifyGoogleLoginOAuthState(stateParam, csrfCookie);

  if (errorParam) {
    const errorDesc = req.nextUrl.searchParams.get("error_description") || errorParam;
    const res = NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDesc)}`, req.url)
    );
    clearGoogleLoginCookie(res);
    return res;
  }

  if (!code || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    const res = NextResponse.redirect(
      new URL("/login?error=Missing+code+or+Google+OAuth+config", req.url)
    );
    clearGoogleLoginCookie(res);
    return res;
  }

  if (!oauthVerified) {
    const res = NextResponse.redirect(
      new URL("/login?error=Invalid+or+expired+OAuth+state", req.url)
    );
    clearGoogleLoginCookie(res);
    return res;
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
      const bad = NextResponse.redirect(
        new URL("/login?error=Google+token+exchange+failed", req.url)
      );
      clearGoogleLoginCookie(bad);
      return bad;
    }

    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    // Get user info
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      const bad = NextResponse.redirect(
        new URL("/login?error=Failed+to+get+Google+profile", req.url)
      );
      clearGoogleLoginCookie(bad);
      return bad;
    }

    const profile = (await userInfoRes.json()) as GoogleUserInfo;

    if (!profile.email) {
      const bad = NextResponse.redirect(
        new URL("/login?error=Google+account+has+no+email", req.url)
      );
      clearGoogleLoginCookie(bad);
      return bad;
    }

    type SessionUser = {
      id: string;
      email: string;
      display_name?: string | null;
      image?: string | null;
      role?: string | null;
    };
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
      const bad = NextResponse.redirect(new URL("/login?error=Could+not+create+session", req.url));
      clearGoogleLoginCookie(bad);
      return bad;
    }

    const token = generateToken(user.id, user.email);
    await setSession(token);

    // Role-aware home wins for patient/doctor; admins and others may use signed redirect path.
    const role = user.role ?? (await getUserRole(user.id));
    const redirectTo = resolveRoleHomeHref(role, oauthVerified.redirect);
    const res = NextResponse.redirect(new URL(redirectTo, req.url));
    clearGoogleLoginCookie(res);
    return res;
  } catch (err: unknown) {
    console.error("Google callback error:", err);
    const res = NextResponse.redirect(
      new URL("/login?error=Google+sign-in+failed", req.url)
    );
    clearGoogleLoginCookie(res);
    return res;
  }
}
