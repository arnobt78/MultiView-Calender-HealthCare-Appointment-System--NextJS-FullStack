/**
 * OAuth `state` binding — HMAC-signed httpOnly cookies + random nonce sent to Google.
 *
 * Why: Google returns `state` unchanged. If `state` were a user id or redirect path only,
 * an attacker could fixate OAuth and bind tokens / sessions to the wrong account.
 * We send an unguessable nonce as `state` and store `{ nonce, … }` in a signed cookie
 * that only our server can verify (AUTH_SECRET). Callback compares `state === nonce`
 * and reads the rest (userId or post-login redirect) from the cookie, then clears it.
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

function getSigningSecret(): string {
  const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) {
    throw new Error(
      "AUTH_SECRET or NEXTAUTH_SECRET is required to sign OAuth state cookies."
    );
  }
  return s;
}

/** 10 minutes — enough for user to complete consent, short enough to limit replay. */
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

export const GCAL_OAUTH_COOKIE_NAME = "gcal-oauth-state";
export const GOOGLE_LOGIN_OAUTH_COOKIE_NAME = "google-oauth-csrf";

type CalendarOAuthPayload = {
  k: "gcal";
  userId: string;
  nonce: string;
  exp: number;
};

type GoogleLoginOAuthPayload = {
  k: "glogin";
  nonce: string;
  redirect: string;
  exp: number;
};

function signPayload(payload: CalendarOAuthPayload | GoogleLoginOAuthPayload): string {
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", getSigningSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifySignature(cookieValue: string): string | null {
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = createHmac("sha256", getSigningSecret()).update(data).digest("base64url");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    return Buffer.from(data, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

/**
 * Start Google Calendar OAuth: returns the nonce for Google's `state` param and the
 * signed cookie value to set on the redirect response.
 */
export function createCalendarOAuthState(userId: string): {
  googleState: string;
  cookieValue: string;
} {
  const nonce = randomBytes(24).toString("hex");
  const payload: CalendarOAuthPayload = {
    k: "gcal",
    userId,
    nonce,
    exp: Date.now() + OAUTH_STATE_MAX_AGE_MS,
  };
  return { googleState: nonce, cookieValue: signPayload(payload) };
}

/**
 * After Google redirects back: verify `state` matches the signed cookie and return userId.
 */
export function verifyCalendarOAuthState(
  stateFromGoogle: string | null,
  cookieValue: string | undefined | null
): { userId: string } | null {
  if (!stateFromGoogle || !cookieValue) return null;
  const raw = verifySignature(cookieValue);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as { k?: unknown }).k !== "gcal" ||
    typeof (parsed as { userId?: unknown }).userId !== "string" ||
    typeof (parsed as { nonce?: unknown }).nonce !== "string" ||
    typeof (parsed as { exp?: unknown }).exp !== "number"
  ) {
    return null;
  }
  const p = parsed as CalendarOAuthPayload;
  if (Date.now() > p.exp) return null;
  if (p.nonce !== stateFromGoogle) return null;
  return { userId: p.userId };
}

/**
 * Start app Google login: nonce as `state`, post-auth redirect path stored in signed cookie.
 */
export function createGoogleLoginOAuthState(safeRedirectPath: string): {
  googleState: string;
  cookieValue: string;
} {
  const nonce = randomBytes(24).toString("hex");
  const payload: GoogleLoginOAuthPayload = {
    k: "glogin",
    nonce,
    redirect: safeRedirectPath,
    exp: Date.now() + OAUTH_STATE_MAX_AGE_MS,
  };
  return { googleState: nonce, cookieValue: signPayload(payload) };
}

/**
 * Verify Google login callback `state` against cookie; returns safe redirect path or null.
 */
export function verifyGoogleLoginOAuthState(
  stateFromGoogle: string | null,
  cookieValue: string | undefined | null
): { redirect: string } | null {
  if (!stateFromGoogle || !cookieValue) return null;
  const raw = verifySignature(cookieValue);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as { k?: unknown }).k !== "glogin" ||
    typeof (parsed as { nonce?: unknown }).nonce !== "string" ||
    typeof (parsed as { redirect?: unknown }).redirect !== "string" ||
    typeof (parsed as { exp?: unknown }).exp !== "number"
  ) {
    return null;
  }
  const p = parsed as GoogleLoginOAuthPayload;
  if (Date.now() > p.exp) return null;
  if (p.nonce !== stateFromGoogle) return null;
  const path = p.redirect;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return { redirect: path };
}

/** Cookie options shared by OAuth state cookies (httpOnly, short TTL). */
export function oauthStateCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(OAUTH_STATE_MAX_AGE_MS / 1000),
  };
}
