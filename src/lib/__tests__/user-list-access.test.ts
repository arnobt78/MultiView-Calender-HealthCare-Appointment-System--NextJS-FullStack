import { describe, expect, it } from "vitest";
import {
  canClientFetchAdminUsersList,
  canClientFetchUsersList,
} from "@/lib/user-list-access";

describe("user-list-access", () => {
  it("allows patients to fetch doctor list only", () => {
    expect(canClientFetchUsersList("patient", { role: "doctor", limit: 200 })).toBe(true);
    expect(canClientFetchUsersList("patient", { role: "admin", limit: 50 })).toBe(false);
    expect(canClientFetchUsersList("patient", {})).toBe(false);
  });

  it("allows staff to fetch any user list filter", () => {
    expect(canClientFetchUsersList("admin", { role: "admin", limit: 50 })).toBe(true);
    expect(canClientFetchUsersList("doctor", { role: "admin", limit: 50 })).toBe(true);
  });

  it("gates admin roster prefetch on detail screens", () => {
    expect(canClientFetchAdminUsersList("patient")).toBe(false);
    expect(canClientFetchAdminUsersList("doctor")).toBe(true);
    expect(canClientFetchAdminUsersList("admin")).toBe(true);
  });
});
