import { afterEach, describe, expect, it, vi } from "vitest";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

describe("copy-to-clipboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes trimmed text and returns true on success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await expect(copyTextToClipboard("  abc-123  ")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("abc-123");
  });

  it("returns false for empty text", async () => {
    const writeText = vi.fn();
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await expect(copyTextToClipboard("")).resolves.toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("returns false when clipboard throws", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });

    await expect(copyTextToClipboard("id")).resolves.toBe(false);
  });
});
