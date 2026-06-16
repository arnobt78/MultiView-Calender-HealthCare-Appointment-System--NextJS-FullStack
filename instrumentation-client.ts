/**
 * Browser Sentry — loads before client bundles (@sentry/nextjs v10).
 * Tunnel: /api/monitoring (see src/lib/sentry-tunnel.ts).
 */
import * as Sentry from "@sentry/nextjs";
import { initSentryClient } from "@/lib/sentry-client-init";

initSentryClient();

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
