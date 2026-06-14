import { describe, expect, it } from "vitest";
import {
  googleCalendarConnectedReturnUrl,
  googleCalendarFailedReturnUrl,
  GOOGLE_CALENDAR_CP_PATH,
  GOOGLE_CALENDAR_OAUTH_CONNECTED_PARAM,
  isGoogleCalendarOAuthConnectedParam,
} from "@/lib/google-calendar-routes";

describe("google-calendar-routes", () => {
  it("success redirect targets CP google-calendar with gcal=connected", () => {
    const url = googleCalendarConnectedReturnUrl("http://localhost:3000");
    expect(url.pathname).toBe(GOOGLE_CALENDAR_CP_PATH);
    expect(url.search).toBe(`?${GOOGLE_CALENDAR_OAUTH_CONNECTED_PARAM}`);
    expect(url.searchParams.get("gcal")).toBe("connected");
  });

  it("isGoogleCalendarOAuthConnectedParam detects OAuth success query", () => {
    const params = new URLSearchParams(GOOGLE_CALENDAR_OAUTH_CONNECTED_PARAM);
    expect(isGoogleCalendarOAuthConnectedParam(params)).toBe(true);
    expect(isGoogleCalendarOAuthConnectedParam(new URLSearchParams())).toBe(false);
  });

  it("failure redirect targets CP google-calendar with error", () => {
    const url = googleCalendarFailedReturnUrl("http://localhost:3000");
    expect(url.pathname).toBe(GOOGLE_CALENDAR_CP_PATH);
    expect(url.searchParams.get("error")).toBe("gcal_failed");
  });
});
