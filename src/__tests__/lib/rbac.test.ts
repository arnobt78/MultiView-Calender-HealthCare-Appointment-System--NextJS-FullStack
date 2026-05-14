/**
 * Unit tests — rbac.ts
 * Verifies all role-checking helpers without DB.
 */
import { describe, it, expect } from "vitest";
import {
  isPatientRole,
  isAdminRole,
  isDoctorRole,
  isStaffRole,
} from "@/lib/rbac";

describe("RBAC role helpers", () => {

  describe("isPatientRole", () => {
    it("returns true for 'patient'", () => expect(isPatientRole("patient")).toBe(true));
    it("returns false for 'admin'", () => expect(isPatientRole("admin")).toBe(false));
    it("returns false for null", () => expect(isPatientRole(null)).toBe(false));
  });

  describe("isAdminRole", () => {
    it("returns true for 'admin'", () => expect(isAdminRole("admin")).toBe(true));
    it("returns false for 'doctor'", () => expect(isAdminRole("doctor")).toBe(false));
  });

  describe("isDoctorRole", () => {
    it("returns true for 'doctor'", () => expect(isDoctorRole("doctor")).toBe(true));
    it("returns false for 'admin'", () => expect(isDoctorRole("admin")).toBe(false));
  });

  describe("isStaffRole", () => {
    it("returns true for 'admin'", () => expect(isStaffRole("admin")).toBe(true));
    it("returns true for 'doctor'", () => expect(isStaffRole("doctor")).toBe(true));
    it("returns false for 'patient'", () => expect(isStaffRole("patient")).toBe(false));
    it("returns false for null", () => expect(isStaffRole(null)).toBe(false));
  });

  describe("edge cases — empty / null / unknown roles", () => {
    for (const role of [null, undefined, "", "unknown"]) {
      it(`isPatientRole(${JSON.stringify(role)}) is false`, () =>
        expect(isPatientRole(role as string | null)).toBe(false));
      it(`isStaffRole(${JSON.stringify(role)}) is false`, () =>
        expect(isStaffRole(role as string | null)).toBe(false));
    }
  });

});
