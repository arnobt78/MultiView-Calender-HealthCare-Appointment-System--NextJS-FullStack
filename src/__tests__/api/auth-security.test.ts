/**
 * Integration-style tests — Auth & Security
 * Tests the open-redirect guard, rate-limit helpers, and OAuth state validation
 * without a live HTTP server (logic extracted from route handlers).
 */
import { describe, it, expect } from "vitest";

// ── Open redirect guard logic (mirrors callback/google/route.ts) ──────────────
function isSafeRedirectPath(state: string): boolean {
  return state.startsWith("/") && !state.startsWith("//");
}

function resolveRedirect(state: string): string {
  return isSafeRedirectPath(state) ? state : "/dashboard";
}

describe("OAuth callback open-redirect guard", () => {
  it("allows normal same-origin path", () => {
    expect(resolveRedirect("/control-panel/dashboard-overview")).toBe(
      "/control-panel/dashboard-overview"
    );
  });

  it("allows nested path", () => {
    expect(resolveRedirect("/control-panel/patients/abc")).toBe(
      "/control-panel/patients/abc"
    );
  });

  it("blocks protocol-relative URL (//evil.com)", () => {
    expect(resolveRedirect("//evil.com/steal")).toBe("/dashboard");
  });

  it("blocks http:// absolute URL", () => {
    expect(resolveRedirect("http://evil.com")).toBe("/dashboard");
  });

  it("blocks https:// absolute URL", () => {
    expect(resolveRedirect("https://attacker.io")).toBe("/dashboard");
  });

  it("falls back to /dashboard for empty string", () => {
    expect(resolveRedirect("")).toBe("/dashboard");
  });

  it("falls back to /dashboard for non-path string", () => {
    expect(resolveRedirect("javascript:alert(1)")).toBe("/dashboard");
  });
});

// ── Demo auth guard (mirrors auth/demo/route.ts) ──────────────────────────────
function isDemoAuthEnabled(env: string | undefined): boolean {
  return env === "true";
}

describe("Demo auth ENABLE_DEMO_AUTH guard", () => {
  it("blocks when env var is missing", () => {
    expect(isDemoAuthEnabled(undefined)).toBe(false);
  });

  it("blocks when env var is 'false'", () => {
    expect(isDemoAuthEnabled("false")).toBe(false);
  });

  it("blocks when env var is '1'", () => {
    expect(isDemoAuthEnabled("1")).toBe(false);
  });

  it("allows only when env var is exactly 'true'", () => {
    expect(isDemoAuthEnabled("true")).toBe(true);
  });
});

// ── Patient portal booking doctorId validation ───────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id: string): boolean {
  return UUID_RE.test(id);
}

describe("patient-portal POST doctorId validation", () => {
  it("accepts a valid UUID", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejects a non-UUID string", () => {
    expect(isValidUUID("not-a-uuid")).toBe(false);
  });

  it("rejects SQL injection", () => {
    expect(isValidUUID("'; DROP TABLE users; --")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUUID("")).toBe(false);
  });
});

// ── Date validation logic ────────────────────────────────────────────────────
function validateDates(start: string, end: string): { ok: boolean; error?: string } {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime())) return { ok: false, error: "Invalid start date" };
  if (Number.isNaN(e.getTime())) return { ok: false, error: "Invalid end date" };
  if (e <= s) return { ok: false, error: "end must be after start" };
  return { ok: true };
}

describe("patient-portal date validation", () => {
  it("accepts valid date range", () => {
    const result = validateDates("2026-05-01T09:00:00Z", "2026-05-01T10:00:00Z");
    expect(result.ok).toBe(true);
  });

  it("rejects invalid start date", () => {
    const result = validateDates("not-a-date", "2026-05-01T10:00:00Z");
    expect(result.ok).toBe(false);
  });

  it("rejects end before start", () => {
    const result = validateDates("2026-05-01T10:00:00Z", "2026-05-01T09:00:00Z");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("end must be after start");
  });

  it("rejects equal start and end", () => {
    const result = validateDates("2026-05-01T09:00:00Z", "2026-05-01T09:00:00Z");
    expect(result.ok).toBe(false);
  });
});
