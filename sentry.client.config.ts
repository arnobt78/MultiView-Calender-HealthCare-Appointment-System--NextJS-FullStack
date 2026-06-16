/**
 * Legacy client entry — v10 primary loader is instrumentation-client.ts.
 * Kept so older Sentry webpack hooks still resolve; init is idempotent.
 */
import { initSentryClient } from "@/lib/sentry-client-init";

initSentryClient();
