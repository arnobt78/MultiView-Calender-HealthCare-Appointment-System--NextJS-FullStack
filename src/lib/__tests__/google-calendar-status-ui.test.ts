import { describe, it, expect } from "vitest";
import {
  isGoogleCalendarStatsSkeleton,
  isGoogleCalendarManualRefreshUi,
} from "@/lib/google-calendar-status-ui";

describe("isGoogleCalendarStatsSkeleton", () => {
  it("returns true when listBodyLoading", () => {
    expect(isGoogleCalendarStatsSkeleton(true)).toBe(true);
  });

  it("returns false when cache is warm", () => {
    expect(isGoogleCalendarStatsSkeleton(false)).toBe(false);
  });
});

describe("isGoogleCalendarManualRefreshUi", () => {
  it("returns true when user-initiated refresh is pending", () => {
    expect(isGoogleCalendarManualRefreshUi(true)).toBe(true);
  });

  it("returns false during silent background refetch", () => {
    expect(isGoogleCalendarManualRefreshUi(false)).toBe(false);
  });
});
