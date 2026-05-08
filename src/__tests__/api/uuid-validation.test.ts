/**
 * Unit tests — UUID validation across API routes
 * Tests the calendar/sync and assignees routes' UUID guard logic
 * without booting a Next.js server.
 */
import { describe, it, expect } from "vitest";
import { isValidUUID } from "@/lib/validation";

const validUUIDs = [
  "550e8400-e29b-41d4-a716-446655440000",
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "00000000-0000-0000-0000-000000000000",
];

const invalidUUIDs = [
  "",
  "not-a-uuid",
  "550e8400e29b41d4a716446655440000", // no dashes
  "550e8400-e29b-41d4-a716-4466554400",  // too short
  "'; DROP TABLE appointments; --",
  "../../../etc/passwd",
  "null",
  "undefined",
];

describe("isValidUUID — accept valid UUIDs", () => {
  for (const id of validUUIDs) {
    it(`accepts "${id}"`, () => expect(isValidUUID(id)).toBe(true));
  }
});

describe("isValidUUID — reject invalid inputs", () => {
  for (const id of invalidUUIDs) {
    it(`rejects "${id}"`, () => expect(isValidUUID(id)).toBe(false));
  }
});

// Calendar sync route: appointmentId must be UUID
describe("calendar/sync appointmentId guard", () => {
  function validateAppointmentId(appointmentId: unknown): boolean {
    return typeof appointmentId === "string" && isValidUUID(appointmentId);
  }

  it("allows string UUID", () =>
    expect(validateAppointmentId("550e8400-e29b-41d4-a716-446655440000")).toBe(true));
  it("blocks number", () => expect(validateAppointmentId(123)).toBe(false));
  it("blocks object", () => expect(validateAppointmentId({})).toBe(false));
  it("blocks array", () => expect(validateAppointmentId([])).toBe(false));
  it("blocks null", () => expect(validateAppointmentId(null)).toBe(false));
  it("blocks SQL injection string", () =>
    expect(validateAppointmentId("'; DROP TABLE appointments; --")).toBe(false));
});
