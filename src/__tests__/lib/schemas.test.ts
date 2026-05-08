/**
 * Unit tests — Zod schemas (auth, patient, appointment)
 * Ensures validation accepts good input and rejects bad input.
 */
import { describe, it, expect } from "vitest";
import { registerRequestSchema } from "@/lib/schemas/auth";
import { patientCoreSchema as patientCreateSchema } from "@/lib/schemas/patient";
import { appointmentCreateSchema } from "@/lib/schemas/appointment";

describe("registerRequestSchema", () => {
  const valid = { email: "user@example.com", password: "Pass1234!", display_name: "Alice" };

  it("accepts valid registration data", () => {
    expect(registerRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts without optional display_name", () => {
    expect(registerRequestSchema.safeParse({ email: valid.email, password: valid.password }).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(registerRequestSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects short password (< 6 chars)", () => {
    expect(registerRequestSchema.safeParse({ ...valid, password: "abc" }).success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _e, ...rest } = valid;
    expect(registerRequestSchema.safeParse(rest).success).toBe(false);
  });
});

// patientCoreSchema uses first_name/last_name (snake_case, Prisma convention)
describe("patientCoreSchema", () => {
  const valid = {
    first_name: "Jane",
    last_name: "Doe",
    email: "jane@example.com",
    date_of_birth: "1990-01-15",
  };

  it("accepts valid patient data", () => {
    expect(patientCreateSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(patientCreateSchema.safeParse({ ...valid, email: "bad" }).success).toBe(false);
  });

  it("rejects empty first_name", () => {
    expect(patientCreateSchema.safeParse({ ...valid, first_name: "" }).success).toBe(false);
  });

  it("allows optional email (undefined)", () => {
    const { email: _e, ...rest } = valid;
    expect(patientCreateSchema.safeParse(rest).success).toBe(true);
  });
});

describe("appointmentCreateSchema", () => {
  const now = new Date("2026-05-01T09:00:00.000Z").toISOString();
  const later = new Date("2026-05-01T10:00:00.000Z").toISOString();
  const valid = { title: "Check-up", start: now, end: later };

  it("accepts valid appointment", () => {
    expect(appointmentCreateSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing title", () => {
    const { title: _t, ...rest } = valid;
    expect(appointmentCreateSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(appointmentCreateSchema.safeParse({ ...valid, title: "" }).success).toBe(false);
  });

  it("rejects end before start", () => {
    expect(appointmentCreateSchema.safeParse({ ...valid, end: now, start: later }).success).toBe(false);
  });
});
