import { describe, expect, it } from "vitest";
import {
  activeInactiveFilterOptions,
  calendarClinicalRoleFilterOptions,
  careTierFilterOptions,
  findFilterOptionLabel,
  invoiceStatusFilterOptions,
  orgMemberRoleFilterOptions,
  userRoleFilterOptions,
} from "@/lib/filter-select-option-presets";

describe("filter-select-option-presets", () => {
  it("userRoleFilterOptions includes icons for each role", () => {
    const opts = userRoleFilterOptions();
    expect(opts.find((o) => o.value === "admin")?.icon).toBeDefined();
    expect(opts.find((o) => o.value === "doctor")?.textClassName).toContain("emerald");
    expect(opts.find((o) => o.value === "patient")?.textClassName).toContain("sky");
  });

  it("orgMemberRoleFilterOptions mirrors org member roles", () => {
    const opts = orgMemberRoleFilterOptions();
    expect(opts).toHaveLength(4);
    expect(opts.some((o) => o.value === "doctor" && o.icon)).toBe(true);
  });

  it("invoiceStatusFilterOptions uses status text classes", () => {
    const paid = invoiceStatusFilterOptions().find((o) => o.value === "paid");
    expect(paid?.textClassName).toContain("emerald");
    expect(paid?.icon).toBeDefined();
  });

  it("activeInactiveFilterOptions colors active and inactive", () => {
    const opts = activeInactiveFilterOptions();
    expect(opts.find((o) => o.value === "active")?.textClassName).toContain("emerald");
    expect(opts.find((o) => o.value === "inactive")?.textClassName).toContain("slate");
  });

  it("careTierFilterOptions includes tier stages", () => {
    const opts = careTierFilterOptions();
    expect(opts.find((o) => o.value === "10")?.label).toMatch(/Critical/);
  });

  it("calendarClinicalRoleFilterOptions includes owner and treating icons", () => {
    const opts = calendarClinicalRoleFilterOptions();
    expect(opts.find((o) => o.value === "calendar_owner")?.icon).toBeDefined();
    expect(opts.find((o) => o.value === "treating_referred")?.icon).toBeDefined();
  });

  it("findFilterOptionLabel resolves label from options", () => {
    const opts = userRoleFilterOptions();
    expect(findFilterOptionLabel(opts, "admin", "fallback")).toBe("Admin");
    expect(findFilterOptionLabel(opts, "all", "fallback")).toBe("All Roles");
  });
});
