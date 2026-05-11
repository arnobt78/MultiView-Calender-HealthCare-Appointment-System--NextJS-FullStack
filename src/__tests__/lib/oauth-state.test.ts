/**
 * Unit tests — oauth-state.ts
 * HMAC-signed OAuth cookies: calendar binding + Google login CSRF.
 */
import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.AUTH_SECRET = "unit-test-oauth-secret-min-32-chars!!";
});

const {
  createCalendarOAuthState,
  verifyCalendarOAuthState,
  createGoogleLoginOAuthState,
  verifyGoogleLoginOAuthState,
} = await import("@/lib/oauth-state");

describe("createCalendarOAuthState / verifyCalendarOAuthState", () => {
  it("round-trips userId when state matches cookie", () => {
    const { googleState, cookieValue } = createCalendarOAuthState("user-uuid-123");
    const out = verifyCalendarOAuthState(googleState, cookieValue);
    expect(out).toEqual({ userId: "user-uuid-123" });
  });

  it("rejects wrong state nonce", () => {
    const { cookieValue } = createCalendarOAuthState("user-1");
    expect(verifyCalendarOAuthState("wrong-nonce", cookieValue)).toBeNull();
  });

  it("rejects tampered cookie signature", () => {
    const { googleState, cookieValue } = createCalendarOAuthState("user-1");
    const tampered = cookieValue.slice(0, -4) + "XXXX";
    expect(verifyCalendarOAuthState(googleState, tampered)).toBeNull();
  });

  it("rejects missing cookie or state", () => {
    const { googleState } = createCalendarOAuthState("u");
    expect(verifyCalendarOAuthState(null, "cookie")).toBeNull();
    expect(verifyCalendarOAuthState(googleState, undefined)).toBeNull();
  });
});

describe("createGoogleLoginOAuthState / verifyGoogleLoginOAuthState", () => {
  it("round-trips safe redirect path", () => {
    const { googleState, cookieValue } = createGoogleLoginOAuthState("/dashboard");
    const out = verifyGoogleLoginOAuthState(googleState, cookieValue);
    expect(out).toEqual({ redirect: "/dashboard" });
  });

  it("rejects mismatched state", () => {
    const { cookieValue } = createGoogleLoginOAuthState("/insights");
    expect(verifyGoogleLoginOAuthState("other", cookieValue)).toBeNull();
  });
});
