import { describe, expect, it } from "vitest";
import { controlPanelStaffDetailHref } from "@/lib/entity-routes";

describe("controlPanelStaffDetailHref", () => {
  const userId = "8f365018-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

  it("routes admin staff to CP users detail", () => {
    expect(controlPanelStaffDetailHref(userId, "admin")).toBe(
      `/control-panel/users/${userId}`
    );
  });

  it("routes doctor staff to CP doctors detail", () => {
    expect(controlPanelStaffDetailHref(userId, "doctor")).toBe(
      `/control-panel/doctors/${userId}`
    );
  });

  it("defaults unknown role to doctors detail (legacy audit rows)", () => {
    expect(controlPanelStaffDetailHref(userId, null)).toBe(
      `/control-panel/doctors/${userId}`
    );
  });
});
