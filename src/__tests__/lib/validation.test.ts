/**
 * Unit tests — validation.ts
 * Verifies UUID, email, and other validators.
 */
import { describe, it, expect } from "vitest";
import { isValidUUID } from "@/lib/validation";

describe("isValidUUID", () => {
  it("accepts valid v4 UUID", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("accepts uppercase UUID", () => {
    expect(isValidUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("rejects empty string", () => expect(isValidUUID("")).toBe(false));
  it("rejects short string", () => expect(isValidUUID("abc")).toBe(false));
  it("rejects UUID with missing dashes", () =>
    expect(isValidUUID("550e8400e29b41d4a716446655440000")).toBe(false));
  it("rejects SQL injection attempt", () =>
    expect(isValidUUID("'; DROP TABLE users; --")).toBe(false));
  it("rejects null-coerced string", () => expect(isValidUUID("null")).toBe(false));
});
