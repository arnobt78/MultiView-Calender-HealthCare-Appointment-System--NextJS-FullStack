import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const initMock = vi.fn();

vi.mock("@sentry/nextjs", () => ({
  init: initMock,
}));

describe("initSentryClient", () => {
  const originalDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  beforeEach(() => {
    initMock.mockClear();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = originalDsn;
    vi.resetModules();
  });

  it("no-ops when DSN is unset", async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    const { initSentryClient } = await import("@/lib/sentry-client-init");
    initSentryClient();
    expect(initMock).not.toHaveBeenCalled();
  });

  it("initializes with same-origin tunnel when DSN is set", async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://abc123@o123.ingest.sentry.io/456789";
    const { initSentryClient } = await import("@/lib/sentry-client-init");
    initSentryClient();
    expect(initMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://abc123@o123.ingest.sentry.io/456789",
        tunnel: "/api/monitoring",
      })
    );
  });
});
