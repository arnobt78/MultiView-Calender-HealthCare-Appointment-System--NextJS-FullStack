import { describe, it, expect } from "vitest";
import { isGoogleCalendarEventsPreviewLoading } from "@/lib/google-calendar-preview-loading";

const base = {
  isConnected: true,
  isFetching: false,
  listBodyLoading: false,
  eventCount: 0,
  eventsFetchWarning: null,
  oauthConnectPhase: false,
};

describe("isGoogleCalendarEventsPreviewLoading", () => {
  it("returns true when listBodyLoading", () => {
    expect(
      isGoogleCalendarEventsPreviewLoading({ ...base, listBodyLoading: true })
    ).toBe(true);
  });

  it("returns true when connected, fetching, and no events yet", () => {
    expect(
      isGoogleCalendarEventsPreviewLoading({
        ...base,
        isFetching: true,
        eventCount: 0,
      })
    ).toBe(true);
  });

  it("returns true during oauth connect phase before isFetching", () => {
    expect(
      isGoogleCalendarEventsPreviewLoading({
        ...base,
        oauthConnectPhase: true,
      })
    ).toBe(true);
  });

  it("returns false when fetching but events already cached (stale-while-revalidate)", () => {
    expect(
      isGoogleCalendarEventsPreviewLoading({
        ...base,
        isFetching: true,
        eventCount: 3,
      })
    ).toBe(false);
  });

  it("returns false when eventsFetchWarning is set", () => {
    expect(
      isGoogleCalendarEventsPreviewLoading({
        ...base,
        isFetching: true,
        eventsFetchWarning: {
          code: "SERVICE_DISABLED",
          message: "API disabled",
        },
      })
    ).toBe(false);
  });

  it("returns false when not connected and not listBodyLoading", () => {
    expect(
      isGoogleCalendarEventsPreviewLoading({
        ...base,
        isConnected: false,
        isFetching: true,
      })
    ).toBe(false);
  });

  it("returns true when isStatusPending before isFetching", () => {
    expect(
      isGoogleCalendarEventsPreviewLoading({
        ...base,
        isStatusPending: true,
      })
    ).toBe(true);
  });

  it("returns false when connected, settled, and genuinely empty", () => {
    expect(isGoogleCalendarEventsPreviewLoading({ ...base })).toBe(false);
  });
});
