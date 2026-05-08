/**
 * Unit tests — auth.ts
 * Verifies JWT generation/verification and type-safe narrowing.
 */
import { describe, it, expect, beforeAll } from "vitest";

// Set JWT secret before module import so getJwtSecret() doesn't throw.
beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-for-unit-tests-only";
});

const { generateToken, verifyToken } = await import("@/lib/auth");

describe("generateToken / verifyToken round-trip", () => {
  it("verifies a freshly generated token", () => {
    const token = generateToken("user-123", "test@example.com");
    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe("user-123");
    expect(decoded?.email).toBe("test@example.com");
  });

  it("returns null for a tampered token", () => {
    const token = generateToken("user-123", "test@example.com");
    const tampered = token.slice(0, -5) + "XXXXX";
    expect(verifyToken(tampered)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(verifyToken("")).toBeNull();
  });

  it("returns null for a random string", () => {
    expect(verifyToken("not.a.jwt")).toBeNull();
  });

  it("returns null for a base64-only string", () => {
    expect(verifyToken("eyJhbGciOiJIUzI1NiJ9.e30.FAKE")).toBeNull();
  });
});

describe("verifyToken — type safety", () => {
  it("returns an object with userId and email strings", () => {
    const token = generateToken("u1", "u1@test.com");
    const result = verifyToken(token);
    expect(typeof result?.userId).toBe("string");
    expect(typeof result?.email).toBe("string");
  });
});
