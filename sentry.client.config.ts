/**
 * Sentry client — tunnel via /api/monitoring so ad blockers do not block ingest.
 * No-op when NEXT_PUBLIC_SENTRY_DSN is unset (local dev without Sentry).
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tunnel: "/api/monitoring",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
    enabled: process.env.NODE_ENV === "production",
    debug: false,
  });
}
