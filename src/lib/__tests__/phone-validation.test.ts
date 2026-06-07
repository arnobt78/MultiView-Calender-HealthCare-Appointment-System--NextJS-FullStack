import { describe, expect, it } from "vitest";
import {
  isValidContactPhone,
  parseOptionalPatientPhone,
  validateOptionalPatientPhoneInput,
} from "@/lib/phone-validation";

describe("phone-validation", () => {
  it("accepts E.164 and formatted local numbers", () => {
    expect(isValidContactPhone("+491701234567")).toBe(true);
    expect(isValidContactPhone("+1 (555) 010-1234")).toBe(true);
  });

  it("rejects too few digits and invalid characters", () => {
    expect(isValidContactPhone("12345")).toBe(false);
    expect(isValidContactPhone("abc-def-ghij")).toBe(false);
  });

  it("parseOptionalPatientPhone allows empty and validates non-empty", () => {
    expect(parseOptionalPatientPhone("")).toEqual({ ok: true, phone: null });
    expect(parseOptionalPatientPhone("+491701234567")).toEqual({
      ok: true,
      phone: "+491701234567",
    });
    expect(parseOptionalPatientPhone("bad").ok).toBe(false);
  });

  it("validateOptionalPatientPhoneInput mirrors parse for forms", () => {
    expect(validateOptionalPatientPhoneInput("")).toBeNull();
    expect(validateOptionalPatientPhoneInput("+491701234567")).toBeNull();
    expect(validateOptionalPatientPhoneInput("12")).toBeTruthy();
  });
});
