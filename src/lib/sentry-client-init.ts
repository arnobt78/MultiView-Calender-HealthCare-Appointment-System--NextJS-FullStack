/**
 * Shared browser Sentry init — tunnel via /api/monitoring (ad-blocker safe).
 * Loaded from instrumentation-client.ts (Next.js 16 + @sentry/nextjs v10).
 */
import * as Sentry from "@sentry/nextjs";

/** Init once when DSN is set; no-op in local dev without Sentry env. */
export function initSentryClient(): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    /** Same-origin POST — forwarded by src/app/api/monitoring/route.ts */
    tunnel: "/api/monitoring",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
    enabled: process.env.NODE_ENV === "production",
    debug: false,
  });
}
