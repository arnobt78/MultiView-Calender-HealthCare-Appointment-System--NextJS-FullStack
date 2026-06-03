import { describe, expect, it, vi } from "vitest";
import {
  createSafeSseEnqueue,
  encodeSseData,
  encodeSseError,
  encodeSseHeartbeat,
} from "@/lib/notification-stream-sse";

function decode(chunk: Uint8Array): string {
  return new TextDecoder().decode(chunk);
}

describe("encodeSse helpers", () => {
  it("encodeSseData wraps JSON in SSE data frame", () => {
    const raw = decode(encodeSseData({ type: "connected", userId: "u1" }));
    expect(raw).toBe('data: {"type":"connected","userId":"u1"}\n\n');
  });

  it("encodeSseHeartbeat uses comment frame", () => {
    expect(decode(encodeSseHeartbeat())).toBe(": heartbeat\n\n");
  });

  it("encodeSseError includes code when provided", () => {
    const raw = decode(encodeSseError("DB down", "P1001"));
    expect(raw).toContain('"type":"error"');
    expect(raw).toContain("P1001");
  });
});

describe("createSafeSseEnqueue", () => {
  it("enqueues successfully when controller is open", () => {
    const controller = {
      enqueue: vi.fn(),
      close: vi.fn(),
    };
    const safe = createSafeSseEnqueue(controller);
    const ok = safe.enqueue(encodeSseHeartbeat());
    expect(ok).toBe(true);
    expect(safe.isClosed()).toBe(false);
    expect(controller.enqueue).toHaveBeenCalledTimes(1);
  });

  it("returns false after enqueue throws (closed controller)", () => {
    const onClosed = vi.fn();
    const controller = {
      enqueue: vi.fn(() => {
        throw new TypeError("Invalid state: Controller is already closed");
      }),
      close: vi.fn(),
    };

    const safe = createSafeSseEnqueue(controller, onClosed);
    const ok = safe.enqueue(encodeSseHeartbeat());

    expect(ok).toBe(false);
    expect(safe.isClosed()).toBe(true);
    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  it("skips enqueue when already closed", () => {
    const controller = {
      enqueue: vi.fn(),
      close: vi.fn(),
    };
    const safe = createSafeSseEnqueue(controller);
    safe.close();
    const ok = safe.enqueue(encodeSseHeartbeat());
    expect(ok).toBe(false);
    expect(controller.enqueue).not.toHaveBeenCalled();
  });
});
