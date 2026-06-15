/**
 * Classify Google Calendar API list/push failures for UI warnings (connected but API blocked).
 */

import type { GoogleCalendarEventsFetchWarning } from "@/types/google-calendar";

type GoogleApiErrorBody = {
  error?: {
    code?: number;
    message?: string;
    errors?: Array<{ reason?: string }>;
    details?: Array<{
      "@type"?: string;
      reason?: string;
      metadata?: Record<string, string>;
    }>;
  };
};

/** Extract JSON blob from `listGoogleEvents` thrown message. */
function extractGoogleApiErrorBody(error: unknown): GoogleApiErrorBody | null {
  const raw = error instanceof Error ? error.message : String(error);
  const jsonStart = raw.indexOf("{");
  if (jsonStart < 0) return null;
  try {
    return JSON.parse(raw.slice(jsonStart)) as GoogleApiErrorBody;
  } catch {
    return null;
  }
}

function activationUrlFromBody(body: GoogleApiErrorBody): string | undefined {
  const fromMeta = body.error?.details?.find(
    (d) => d.metadata?.activationUrl?.trim()
  )?.metadata?.activationUrl;
  return fromMeta?.trim() || undefined;
}

/**
 * Map list-events failure to a stable warning code — keeps `connected: true` on GET /api/calendar/sync.
 */
export function classifyGoogleCalendarListError(
  error: unknown
): GoogleCalendarEventsFetchWarning {
  const body = extractGoogleApiErrorBody(error);
  const apiMessage = body?.error?.message?.trim();
  const httpCode = body?.error?.code;
  const reasons = [
    ...(body?.error?.errors?.map((e) => e.reason) ?? []),
    ...(body?.error?.details?.map((d) => d.reason) ?? []),
  ];

  const isServiceDisabled =
    reasons.includes("accessNotConfigured") ||
    reasons.includes("SERVICE_DISABLED") ||
    (apiMessage?.toLowerCase().includes("has not been used") ?? false) ||
    (apiMessage?.toLowerCase().includes("is disabled") ?? false);

  if (isServiceDisabled) {
    return {
      code: "SERVICE_DISABLED",
      message:
        apiMessage ??
        "Google Calendar API is disabled for your Cloud project. Enable it in Google Cloud Console, wait a few minutes, then refresh.",
      activationUrl: body ? activationUrlFromBody(body) : undefined,
    };
  }

  if (httpCode === 403 || reasons.includes("forbidden")) {
    return {
      code: "PERMISSION_DENIED",
      message:
        apiMessage ??
        "Google Calendar denied access. Reconnect or check OAuth scopes in Google Cloud Console.",
    };
  }

  if (httpCode === 429 || reasons.includes("rateLimitExceeded")) {
    return {
      code: "RATE_LIMIT",
      message:
        apiMessage ?? "Google Calendar rate limit reached. Wait a moment and refresh events.",
    };
  }

  return {
    code: "UNKNOWN",
    message:
      apiMessage ??
      "Could not load Google Calendar events. Try refreshing or reconnecting your account.",
  };
}
