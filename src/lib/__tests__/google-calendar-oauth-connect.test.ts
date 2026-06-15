import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  GCAL_OAUTH_BACKFILL_DONE_KEY,
  clearGoogleCalendarOAuthBackfillGuard,
  shouldRunGoogleCalendarOAuthBackfill,
} from "@/lib/google-calendar-oauth-connect";

function mockSessionStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  });
}

describe("google-calendar-oauth-connect", () => {
  beforeEach(() => {
    mockSessionStorage();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("returns false when gcal param is not connected", () => {
    expect(shouldRunGoogleCalendarOAuthBackfill(null)).toBe(false);
    expect(shouldRunGoogleCalendarOAuthBackfill("failed")).toBe(false);
  });

  it("returns true only once per session for connected param", () => {
    expect(shouldRunGoogleCalendarOAuthBackfill("connected")).toBe(true);
    expect(shouldRunGoogleCalendarOAuthBackfill("connected")).toBe(false);
    expect(sessionStorage.getItem(GCAL_OAUTH_BACKFILL_DONE_KEY)).toBe("1");
  });

  it("clearGoogleCalendarOAuthBackfillGuard allows backfill again", () => {
    shouldRunGoogleCalendarOAuthBackfill("connected");
    clearGoogleCalendarOAuthBackfillGuard();
    expect(shouldRunGoogleCalendarOAuthBackfill("connected")).toBe(true);
  });
});
