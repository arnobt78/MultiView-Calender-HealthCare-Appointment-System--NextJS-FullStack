/**
 * Contract tests for GET /api/notifications/stream (mocked session + prisma).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/session", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    notification: { findMany: vi.fn() },
  },
}));

import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/notifications/stream/route";

const USER = { userId: "user-1", email: "staff@test.com" };

function decodeStreamChunk(chunk: Uint8Array): string {
  return new TextDecoder().decode(chunk);
}

async function readStreamUntil(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  predicate: (text: string) => boolean,
  maxChunks = 5
): Promise<string> {
  let accumulated = "";
  for (let i = 0; i < maxChunks; i++) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) accumulated += decodeStreamChunk(value);
    if (predicate(accumulated)) return accumulated;
  }
  return accumulated;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("GET /api/notifications/stream", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/notifications/stream"));
    expect(res.status).toBe(401);
  });

  it("returns SSE headers and connected event", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(USER);
    vi.mocked(prisma.notification.findMany).mockResolvedValue([]);

    const abort = new AbortController();
    const res = await GET(
      new Request("http://localhost/api/notifications/stream", {
        signal: abort.signal,
      })
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");

    const reader = res.body!.getReader();
    const text = await readStreamUntil(reader, (t) => t.includes("connected"));
    expect(text).toContain('"type":"connected"');
    expect(text).toContain("user-1");

    abort.abort();
    await reader.cancel();
  });

  it("polls notifications on interval", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(USER);
    vi.mocked(prisma.notification.findMany).mockResolvedValue([]);

    const abort = new AbortController();
    const res = await GET(
      new Request("http://localhost/api/notifications/stream", {
        signal: abort.signal,
      })
    );
    expect(res.status).toBe(200);

    await vi.advanceTimersByTimeAsync(10_000);

    expect(prisma.notification.findMany).toHaveBeenCalled();

    abort.abort();
    await res.body?.cancel();
  });

  it("emits error and stops on prisma failure", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(USER);
    vi.mocked(prisma.notification.findMany).mockRejectedValueOnce(
      Object.assign(new Error("Can't reach database"), { code: "P1001" })
    );

    const abort = new AbortController();
    const res = await GET(
      new Request("http://localhost/api/notifications/stream", {
        signal: abort.signal,
      })
    );

    await vi.advanceTimersByTimeAsync(10_000);

    expect(prisma.notification.findMany).toHaveBeenCalledTimes(1);

    abort.abort();
    await res.body?.cancel();
  });
});
