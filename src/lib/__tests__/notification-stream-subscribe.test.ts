import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { subscribeNotificationStream } from "@/lib/notification-stream-subscribe";
import { NOTIFICATION_STREAM_URL } from "@/lib/notification-stream";

const invalidateMock = vi.fn<(queryClient: QueryClient) => Promise<void>>(async () => {});

vi.mock("@/lib/query-client", () => ({
  invalidateNotificationsAndCrossTab: (queryClient: QueryClient) => invalidateMock(queryClient),
}));

type MockEventSource = {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: (() => void) | null;
  close: ReturnType<typeof vi.fn>;
};

describe("subscribeNotificationStream", () => {
  let instances: MockEventSource[];

  beforeEach(() => {
    instances = [];
    invalidateMock.mockClear();

    class EventSourceMock {
      url: string;
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: (() => void) | null = null;
      close = vi.fn();

      constructor(url: string) {
        this.url = url;
        instances.push(this as unknown as MockEventSource);
      }
    }

    vi.stubGlobal("EventSource", EventSourceMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("opens EventSource to the notification stream URL", () => {
    const qc = new QueryClient();
    const cleanup = subscribeNotificationStream(qc);
    expect(instances).toHaveLength(1);
    expect(instances[0]?.url).toBe(NOTIFICATION_STREAM_URL);
    cleanup();
  });

  it("invalidates notifications when SSE delivers new rows", () => {
    const qc = new QueryClient();
    subscribeNotificationStream(qc);

    instances[0]?.onmessage?.({
      data: JSON.stringify({
        type: "notifications",
        data: [
          {
            id: "n1",
            user_id: "u1",
            title: "T",
            message: "M",
            type: "info",
            read: false,
            created_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
    } as MessageEvent);

    expect(invalidateMock).toHaveBeenCalledWith(qc);
  });

  it("skips invalidation for empty notifications batch", () => {
    const qc = new QueryClient();
    subscribeNotificationStream(qc);

    instances[0]?.onmessage?.({
      data: JSON.stringify({ type: "notifications", data: [] }),
    } as MessageEvent);

    expect(invalidateMock).not.toHaveBeenCalled();
  });

  it("closes EventSource on cleanup", () => {
    const qc = new QueryClient();
    const cleanup = subscribeNotificationStream(qc);
    const source = instances[0];
    cleanup();
    expect(source?.close).toHaveBeenCalled();
  });

  it("schedules reconnect after error", () => {
    vi.useFakeTimers();
    const qc = new QueryClient();
    subscribeNotificationStream(qc);
    expect(instances).toHaveLength(1);

    instances[0]?.onerror?.();
    vi.advanceTimersByTime(3_000);

    expect(instances).toHaveLength(2);
  });
});
