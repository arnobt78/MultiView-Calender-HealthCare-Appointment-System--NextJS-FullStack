import { describe, expect, it } from "vitest";
import {
  buildInitialMembersFromFormSlots,
  dedupeInitialMembers,
  mapUserRoleToOrgMemberRole,
} from "@/lib/organization-member-role";

describe("mapUserRoleToOrgMemberRole", () => {
  it("maps platform roles", () => {
    expect(mapUserRoleToOrgMemberRole("admin")).toBe("admin");
    expect(mapUserRoleToOrgMemberRole("doctor")).toBe("doctor");
    expect(mapUserRoleToOrgMemberRole("patient")).toBe("patient");
  });

  it("defaults unknown roles to doctor", () => {
    expect(mapUserRoleToOrgMemberRole("unknown")).toBe("doctor");
  });
});

describe("dedupeInitialMembers", () => {
  const creator = "creator-user-id";

  it("skips creator and duplicate userIds", () => {
    expect(
      dedupeInitialMembers(
        [
          { userId: creator, role: "admin" },
          { userId: "doc-1", role: "doctor" },
          { userId: "doc-1", role: "patient" },
        ],
        creator
      )
    ).toEqual([{ userId: "doc-1", role: "doctor" }]);
  });
});

describe("buildInitialMembersFromFormSlots", () => {
  it("builds role slots from form ids", () => {
    expect(
      buildInitialMembersFromFormSlots({
        initialAdminId: "a1",
        initialDoctorId: "d1",
        initialPatientId: "p1",
      })
    ).toEqual([
      { userId: "a1", role: "admin" },
      { userId: "d1", role: "doctor" },
      { userId: "p1", role: "patient" },
    ]);
  });
});
