import { describe, expect, it } from "vitest";
import {
  ORGANIZATION_MEMBERS_ROLE_INLINE_ORDER,
  buildOrganizationMembersRoleCountAriaLabel,
} from "@/components/shared/organization/OrganizationMembersRoleCountInlineRow";

describe("OrganizationMembersRoleCountInlineRow helpers", () => {
  it("orders admin, doctor, patient", () => {
    expect(ORGANIZATION_MEMBERS_ROLE_INLINE_ORDER).toEqual(["admin", "doctor", "patient"]);
  });

  it("builds accessible aria label for role counts", () => {
    expect(
      buildOrganizationMembersRoleCountAriaLabel({ admin: 1, doctor: 8, patient: 1 })
    ).toBe("Admin: 1, Doctor: 8, Patient: 1");
  });

  it("includes zero counts in aria label", () => {
    expect(
      buildOrganizationMembersRoleCountAriaLabel({ admin: 0, doctor: 0, patient: 0 })
    ).toBe("Admin: 0, Doctor: 0, Patient: 0");
  });
});
