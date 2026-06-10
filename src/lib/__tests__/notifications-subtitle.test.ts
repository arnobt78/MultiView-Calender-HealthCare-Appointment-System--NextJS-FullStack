import { describe, expect, it } from "vitest";
import {
  buildNotificationsSubtitleTotalSuffix,
  formatNotificationsSubtitleUpdatedAt,
  resolveNotificationsSubtitleTotal,
  resolveNotificationsSubtitleUpdatedAt,
} from "@/lib/notifications-subtitle";

describe("formatNotificationsSubtitleUpdatedAt", () => {
  it("formats HH:mm:ss from epoch ms", () => {
    const ms = new Date(2026, 5, 10, 14, 5, 49).getTime();
    expect(formatNotificationsSubtitleUpdatedAt(ms)).toBe("14:05:49");
  });
});

describe("resolveNotificationsSubtitleUpdatedAt", () => {
  it("prefers query timestamp over SSR fallback", () => {
    expect(resolveNotificationsSubtitleUpdatedAt(100, 50)).toBe(100);
  });

  it("uses SSR when query dataUpdatedAt is 0", () => {
    expect(resolveNotificationsSubtitleUpdatedAt(0, 999)).toBe(999);
  });
});

describe("resolveNotificationsSubtitleTotal", () => {
  it("prefers query total when cache has data", () => {
    expect(resolveNotificationsSubtitleTotal(12, true, { total: 5 })).toBe(12);
  });

  it("uses SSR total when query has no data yet", () => {
    expect(resolveNotificationsSubtitleTotal(0, false, { total: 7 })).toBe(7);
  });

  it("returns null when neither source is available", () => {
    expect(resolveNotificationsSubtitleTotal(0, false, null)).toBeNull();
  });
});

describe("buildNotificationsSubtitleTotalSuffix", () => {
  it("returns empty when total unknown", () => {
    expect(buildNotificationsSubtitleTotalSuffix(null)).toBe("");
  });

  it("appends total count after time metric", () => {
    expect(buildNotificationsSubtitleTotalSuffix(12)).toBe(" · 12 total");
  });
});
