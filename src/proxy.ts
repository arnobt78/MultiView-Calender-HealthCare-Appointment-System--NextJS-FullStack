/**
 * proxy.ts — Next.js 15+ edge proxy (replaces middleware.ts)
 *
 * The matcher below is the primary gate: only PAGE routes ever reach this
 * function.  All static assets, API routes, image directories, and files
 * with extensions are excluded at the matcher level so they are NEVER
 * processed here.  This eliminates the redirect-loop bug where image
 * requests were incorrectly sent to /login.
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

// ─── constants ────────────────────────────────────────────────────────────────

const COOKIE_NAME = "auth-token";

/** Page paths that do NOT require authentication */
const PUBLIC_PATHS = ["/", "/login", "/register", "/accept-invitation"];

/** Page paths that redirect to /dashboard when the user is already authenticated */
const AUTH_ONLY_PATHS = ["/login", "/register"];

// ─── security headers ─────────────────────────────────────────────────────────

/**
 * Base security headers applied to every response.
 * X-Frame-Options and CSP frame-ancestors are set conditionally per route
 * in step 4b below — public pages allow Vercel's dashboard preview iframe
 * (vercel.com/vercel.live), protected pages deny all framing.
 *
 * NOTE: CSP frame-ancestors supersedes X-Frame-Options in modern browsers.
 * Both are set for maximum compatibility (old browsers fall back to X-Frame-Options).
 */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(self), geolocation=(), payment=(self)",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

/**
 * Base CSP directives shared by all routes.
 * frame-ancestors is appended dynamically per route in step 4b.
 */
const BASE_CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://meet.jit.si https://vercel.live https://vercel.com",
  "script-src-elem 'self' 'unsafe-inline' https://meet.jit.si https://vercel.live https://vercel.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https: http:",
  "connect-src 'self' https://api.groq.com https://generativelanguage.googleapis.com https://api.stripe.com https://*.upstash.io https://meet.jit.si https://vercel.live https://vercel.com",
  "frame-src 'self' https://meet.jit.si https://checkout.stripe.com https://vercel.live https://vercel.com",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

// ─── page-level cache policies ────────────────────────────────────────────────

type PageCache = { pattern: RegExp; browser: string; cdn?: string };

const PAGE_CACHE: PageCache[] = [
  // Auth pages: always fresh
  {
    pattern: /^\/(login|register)/,
    browser: "no-store",
  },
  // Dashboard / protected pages: private, revalidate each request
  {
    pattern: /^\/(dashboard|control-panel|analytics|insights|patient-portal|doctor-portal|home)/,
    browser: "private, no-cache, must-revalidate",
  },
  // Landing page: short public CDN cache (60 s), 5-min SWR
  {
    pattern: /^\/$/,
    browser: "public, max-age=60, stale-while-revalidate=300",
    cdn: "public, max-age=60, stale-while-revalidate=300",
  },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
    if (!secret) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const p = payload as TokenPayload;
    if (!p.userId || !p.email) return null;
    return p;
  } catch {
    return null;
  }
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAuthOnly(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// ─── proxy ───────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. JWT verification ───────────────────────────────────────────────────
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  const authenticated = payload !== null;

  // ── 2. Route guards ───────────────────────────────────────────────────────

  // Authenticated user on /login or /register → role landing (SSR picks portal vs dashboard)
  if (authenticated && isAuthOnly(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Unauthenticated user on a protected page → send to /login
  if (!authenticated && !isPublic(pathname)) {
    const dest = new URL("/login", request.url);
    if (pathname !== "/") dest.searchParams.set("redirect", pathname);
    return NextResponse.redirect(dest);
  }

  // ── 3. Forward verified identity to server components / API routes ────────
  //    Downstream code reads x-user-id from headers() — zero JWT re-work.
  //    We also strip any client-spoofed x-user-* headers.
  const reqHeaders = new Headers(request.headers);
  // Prevent Vercel Toolbar injection on runtime page requests.
  reqHeaders.set("x-vercel-skip-toolbar", "1");
  if (payload) {
    reqHeaders.set("x-user-id", payload.userId);
    reqHeaders.set("x-user-email", payload.email);
  } else {
    reqHeaders.delete("x-user-id");
    reqHeaders.delete("x-user-email");
  }

  const res = NextResponse.next({ request: { headers: reqHeaders } });

  // ── 4. Security headers ───────────────────────────────────────────────────
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.headers.set(k, v));

  // ── 4b. Framing policy — route-aware clickjacking protection ──────────────
  //
  // Public pages (/login, /register, /accept-invitation, /):
  //   Allow framing from Vercel's dashboard preview (vercel.com / vercel.live)
  //   so the deployment thumbnail renders correctly.  All other cross-origin
  //   frames are still blocked.
  //   - CSP frame-ancestors: honoured by all modern browsers.
  //   - X-Frame-Options SAMEORIGIN: legacy fallback (does NOT cover vercel.com,
  //     but browsers that understand frame-ancestors will ignore X-Frame-Options).
  //
  // Protected pages (/dashboard, /control-panel, etc.):
  //   No framing allowed from any origin — maximum clickjacking protection.
  //   - CSP frame-ancestors 'none'
  //   - X-Frame-Options DENY
  if (isPublic(pathname)) {
    // Public pages: allow Vercel's dashboard / preview iframe via CSP frame-ancestors.
    // X-Frame-Options is intentionally omitted here — SAMEORIGIN would block vercel.com
    // (a different origin) even when frame-ancestors explicitly allows it, because some
    // renderers check both and the more-restrictive header wins.  CSP frame-ancestors
    // is the modern standard; browsers that don't support it will allow framing freely,
    // which is acceptable for the public landing/login pages.
    res.headers.set(
      "Content-Security-Policy",
      [
        ...BASE_CSP_DIRECTIVES,
        "frame-ancestors 'self' https://vercel.com https://vercel.live https://*.vercel.app https://*.vercel-insights.com",
      ].join("; ")
    );
  } else {
    res.headers.set(
      "Content-Security-Policy",
      [...BASE_CSP_DIRECTIVES, "frame-ancestors 'none'"].join("; ")
    );
    res.headers.set("X-Frame-Options", "DENY");
  }

  // ── 5. Cache-Control for page routes ─────────────────────────────────────
  for (const { pattern, browser, cdn } of PAGE_CACHE) {
    if (pattern.test(pathname)) {
      res.headers.set("Cache-Control", browser);
      if (cdn) {
        res.headers.set("CDN-Cache-Control", cdn);
        res.headers.set("Vercel-CDN-Cache-Control", cdn);
      }
      break;
    }
  }

  return res;
}

// ─── matcher ─────────────────────────────────────────────────────────────────
//
// ONLY run the proxy on actual page routes.  The negative lookahead excludes:
//   _next        — Next.js build output (JS chunks, image optimizer, etc.)
//   api          — API route handlers (they manage their own auth/cache)
//   images       — /public/images/* static assets
//   doctors      — /public/doctors/* static assets
//   favicon      — favicon files
//   .*\\.\\w+$  — any path ending in a file extension (.ico, .png, .jpg, …)
//
// This means /images/img1.avif, /api/auth/login, /_next/static/*, etc. are
// never processed by the proxy — eliminating the redirect-loop that was
// sending asset requests to /login.

export const config = {
  matcher: [
    "/((?!_next|api|images|doctors|favicon|.*\\.\\w+$).*)",
  ],
};
