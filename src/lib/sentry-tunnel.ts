/**
 * Sentry envelope tunnel helpers — validate DSN and forward to ingest.
 * Used by POST /api/monitoring so browser clients bypass ad-block lists.
 */

const ENVELOPE_HEADER_LINE = 0;

/** Parse DSN from first line of application/x-sentry-envelope body. */
export function parseSentryEnvelopeDsn(envelope: string): string | null {
  const firstLine = envelope.split("\n")[ENVELOPE_HEADER_LINE]?.trim();
  if (!firstLine) return null;
  try {
    const header = JSON.parse(firstLine) as { dsn?: string };
    return typeof header.dsn === "string" && header.dsn.length > 0 ? header.dsn : null;
  } catch {
    return null;
  }
}

/** Reject envelopes targeting a different Sentry project (open-proxy guard). */
export function isAllowedSentryDsn(envelopeDsn: string, configuredDsn: string): boolean {
  try {
    const fromEnvelope = new URL(envelopeDsn);
    const fromEnv = new URL(configuredDsn);
    return fromEnvelope.host === fromEnv.host && fromEnvelope.pathname === fromEnv.pathname;
  } catch {
    return false;
  }
}

/** Build official ingest URL from a Sentry DSN. */
export function getSentryIngestUrl(dsn: string): string {
  const parsed = new URL(dsn);
  const projectId = parsed.pathname.replace(/^\//, "");
  return `https://${parsed.host}/api/${projectId}/envelope/`;
}

export type ForwardSentryEnvelopeResult =
  | { ok: true; status: number }
  | { ok: false; status: number; error: string };

/** Forward validated envelope to Sentry ingest. */
export async function forwardSentryEnvelope(
  envelope: string,
  configuredDsn: string,
  fetchImpl: typeof fetch = fetch
): Promise<ForwardSentryEnvelopeResult> {
  const envelopeDsn = parseSentryEnvelopeDsn(envelope);
  if (!envelopeDsn) {
    return { ok: false, status: 400, error: "Invalid Sentry envelope" };
  }
  if (!isAllowedSentryDsn(envelopeDsn, configuredDsn)) {
    return { ok: false, status: 403, error: "DSN mismatch" };
  }

  const ingestUrl = getSentryIngestUrl(envelopeDsn);
  const response = await fetchImpl(ingestUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-sentry-envelope" },
    body: envelope,
  });

  if (!response.ok) {
    return { ok: false, status: response.status, error: "Upstream ingest failed" };
  }
  return { ok: true, status: response.status };
}
