import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "auth-token";
const PUBLIC_PREFIXES = ["/login", "/register", "/accept-invitation"];
const PUBLIC_EXACT = new Set<string>(["/"]);

// Lightweight reverse-proxy behavior:
// - Attach a request id to every response (observability / log correlation).
// - Gate protected routes at the edge (no client-side flash / wasted render).
// - Add cache hints for fully-public marketing routes so Vercel's edge layer
//   can serve repeated visitors without hitting the origin.
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublicPath =
    PUBLIC_EXACT.has(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  const hasAuthCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (!hasAuthCookie && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    const redirectTarget = `${pathname}${search}`;
    loginUrl.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  const requestId =
    request.headers.get("x-request-id") ||
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  response.headers.set("x-request-id", requestId);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
