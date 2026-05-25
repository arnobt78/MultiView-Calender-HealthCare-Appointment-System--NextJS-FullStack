import { describe, expect, it } from "vitest";
import { resolveRoleHomeHref } from "@/lib/role-home-href";

describe("resolveRoleHomeHref", () => {
  it("doctor always lands on doctor portal even with redirect param", () => {
    expect(resolveRoleHomeHref("doctor", "/dashboard")).toBe("/doctor-portal");
    expect(resolveRoleHomeHref(" Doctor ", "/control-panel")).toBe("/doctor-portal");
  });

  it("patient always lands on patient portal", () => {
    expect(resolveRoleHomeHref("patient", "/dashboard")).toBe("/patient-portal");
  });

  it("admin uses redirect when provided", () => {
    expect(resolveRoleHomeHref("admin", "/control-panel/patient-management")).toBe(
      "/control-panel/patient-management"
    );
    expect(resolveRoleHomeHref("admin", null)).toBe("/control-panel/dashboard-overview");
  });

  it("unknown role falls back to redirect or dashboard", () => {
    expect(resolveRoleHomeHref(null, "/services")).toBe("/services");
    expect(resolveRoleHomeHref(undefined, null)).toBe("/dashboard");
  });
});
