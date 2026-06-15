import { describe, it, expect } from "vitest";
import { classifyGoogleCalendarListError } from "@/lib/google-calendar-api-error";

const SERVICE_DISABLED_PAYLOAD = `Failed to list Google Calendar events: {
  "error": {
    "code": 403,
    "message": "Google Calendar API has not been used in project 147332448758 before or it is disabled.",
    "errors": [{ "reason": "accessNotConfigured" }],
    "details": [{
      "@type": "type.googleapis.com/google.rpc.ErrorInfo",
      "reason": "SERVICE_DISABLED",
      "metadata": {
        "activationUrl": "https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=147332448758"
      }
    }]
  }
}`;

describe("classifyGoogleCalendarListError", () => {
  it("maps disabled Calendar API to SERVICE_DISABLED with activation link", () => {
    const warning = classifyGoogleCalendarListError(new Error(SERVICE_DISABLED_PAYLOAD));

    expect(warning.code).toBe("SERVICE_DISABLED");
    expect(warning.message).toContain("disabled");
    expect(warning.activationUrl).toContain("calendar-json.googleapis.com");
  });

  it("maps generic 403 to PERMISSION_DENIED", () => {
    const warning = classifyGoogleCalendarListError(
      new Error('Failed to list: {"error":{"code":403,"message":"Forbidden"}}')
    );

    expect(warning.code).toBe("PERMISSION_DENIED");
    expect(warning.message).toBe("Forbidden");
  });

  it("maps rate limit to RATE_LIMIT", () => {
    const warning = classifyGoogleCalendarListError(
      new Error('Failed: {"error":{"code":429,"message":"Rate Limit Exceeded","errors":[{"reason":"rateLimitExceeded"}]}}')
    );

    expect(warning.code).toBe("RATE_LIMIT");
  });

  it("falls back to UNKNOWN for non-JSON errors", () => {
    const warning = classifyGoogleCalendarListError(new Error("network down"));

    expect(warning.code).toBe("UNKNOWN");
    expect(warning.message).toContain("Could not load Google Calendar events");
  });
});
