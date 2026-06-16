export const dynamic = "force-dynamic";

import { forwardSentryEnvelope } from "@/lib/sentry-tunnel";

/**
 * Sentry tunnel — same-origin POST so client SDK bypasses ad-blocker blocklists.
 * Client init: instrumentation-client.ts → tunnel `/api/monitoring`.
 * Validates envelope DSN matches NEXT_PUBLIC_SENTRY_DSN before forwarding.
 */
export async function POST(request: Request) {
  const configuredDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!configuredDsn) {
    return new Response("Sentry not configured", { status: 503 });
  }

  const envelope = await request.text();
  if (!envelope.trim()) {
    return new Response("Empty envelope", { status: 400 });
  }

  const result = await forwardSentryEnvelope(envelope, configuredDsn);
  if (!result.ok) {
    return new Response(result.error, { status: result.status });
  }

  return new Response(null, { status: result.status });
}
