/**
 * SSE stream helpers — safe enqueue when client disconnects or DB poll fails.
 */

export type SseStreamController = {
  enqueue: (chunk: Uint8Array) => void;
  close: () => void;
};

export type SafeSseEnqueue = {
  enqueue: (chunk: Uint8Array) => boolean;
  isClosed: () => boolean;
  close: () => void;
};

/** Wrap ReadableStream controller — returns false when stream is already closed. */
export function createSafeSseEnqueue(
  controller: SseStreamController,
  onClosed?: () => void
): SafeSseEnqueue {
  let closed = false;

  const markClosed = () => {
    if (closed) return;
    closed = true;
    onClosed?.();
    try {
      controller.close();
    } catch {
      /* already closed */
    }
  };

  return {
    isClosed: () => closed,
    close: markClosed,
    enqueue: (chunk) => {
      if (closed) return false;
      try {
        controller.enqueue(chunk);
        return true;
      } catch {
        markClosed();
        return false;
      }
    },
  };
}

export function encodeSseData(payload: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export function encodeSseHeartbeat(): Uint8Array {
  return new TextEncoder().encode(`: heartbeat\n\n`);
}

export function encodeSseError(message: string, code?: string): Uint8Array {
  return encodeSseData({ type: "error", message, code });
}
