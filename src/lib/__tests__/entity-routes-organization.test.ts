import { describe, expect, it } from "vitest";
import { organizationDetailHref } from "@/lib/entity-routes";

describe("organizationDetailHref", () => {
  it("returns control-panel path for admin role", () => {
    expect(organizationDetailHref("admin", "abc-123")).toBe(
      "/control-panel/organizations/abc-123"
    );
  });

  it("returns same path for doctor role (CP route)", () => {
    expect(organizationDetailHref("doctor", "xyz-456")).toBe(
      "/control-panel/organizations/xyz-456"
    );
  });
});
