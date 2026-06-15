import { describe, it, expect, vi } from "vitest";
import {
  parseSentryEnvelopeDsn,
  isAllowedSentryDsn,
  getSentryIngestUrl,
  forwardSentryEnvelope,
} from "@/lib/sentry-tunnel";

const CONFIGURED_DSN = "https://abc123@o123.ingest.sentry.io/456789";

function buildEnvelope(dsn: string): string {
  return `${JSON.stringify({ dsn })}\n{"type":"event"}\n{}`;
}

describe("parseSentryEnvelopeDsn", () => {
  it("extracts dsn from envelope header", () => {
    expect(parseSentryEnvelopeDsn(buildEnvelope(CONFIGURED_DSN))).toBe(CONFIGURED_DSN);
  });

  it("returns null for malformed envelope", () => {
    expect(parseSentryEnvelopeDsn("not-json")).toBeNull();
    expect(parseSentryEnvelopeDsn("")).toBeNull();
  });
});

describe("isAllowedSentryDsn", () => {
  it("allows matching project DSN", () => {
    expect(isAllowedSentryDsn(CONFIGURED_DSN, CONFIGURED_DSN)).toBe(true);
  });

  it("rejects different project", () => {
    const other = "https://abc123@o123.ingest.sentry.io/999999";
    expect(isAllowedSentryDsn(other, CONFIGURED_DSN)).toBe(false);
  });
});

describe("getSentryIngestUrl", () => {
  it("builds ingest envelope URL", () => {
    expect(getSentryIngestUrl(CONFIGURED_DSN)).toBe(
      "https://o123.ingest.sentry.io/api/456789/envelope/"
    );
  });
});

describe("forwardSentryEnvelope", () => {
  it("rejects invalid envelope", async () => {
    const result = await forwardSentryEnvelope("bad", CONFIGURED_DSN);
    expect(result).toEqual({ ok: false, status: 400, error: "Invalid Sentry envelope" });
  });

  it("rejects DSN mismatch", async () => {
    const other = "https://abc123@o123.ingest.sentry.io/999999";
    const result = await forwardSentryEnvelope(buildEnvelope(other), CONFIGURED_DSN);
    expect(result).toEqual({ ok: false, status: 403, error: "DSN mismatch" });
  });

  it("forwards valid envelope to ingest", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    const result = await forwardSentryEnvelope(
      buildEnvelope(CONFIGURED_DSN),
      CONFIGURED_DSN,
      fetchMock
    );
    expect(result).toEqual({ ok: true, status: 200 });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://o123.ingest.sentry.io/api/456789/envelope/",
      expect.objectContaining({ method: "POST" })
    );
  });
});
