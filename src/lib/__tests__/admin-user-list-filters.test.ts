import { describe, expect, it } from "vitest";
import type { User } from "@/types/types";

function filterUsers(
  list: User[],
  status: "all" | "active" | "inactive",
  verification: "all" | "verified" | "unverified",
  photo: "all" | "with_photo" | "no_photo"
): User[] {
  let out = list;
  if (status === "active") out = out.filter((u) => u.is_active !== false);
  if (status === "inactive") out = out.filter((u) => u.is_active === false);
  if (verification === "verified") out = out.filter((u) => u.email_verified === true);
  if (verification === "unverified") out = out.filter((u) => !u.email_verified);
  if (photo === "with_photo") out = out.filter((u) => Boolean(u.image?.trim()));
  if (photo === "no_photo") out = out.filter((u) => !u.image?.trim());
  return out;
}

const sample: User[] = [
  {
    id: "1",
    email: "a@test.com",
    display_name: "Active Verified",
    image: "/a.avif",
    is_active: true,
    email_verified: true,
  },
  {
    id: "2",
    email: "b@test.com",
    display_name: "Inactive",
    is_active: false,
    email_verified: false,
  },
];

describe("admin user list filters", () => {
  it("filters by status and verification", () => {
    expect(filterUsers(sample, "active", "all", "all")).toHaveLength(1);
    expect(filterUsers(sample, "inactive", "all", "all")[0]?.id).toBe("2");
    expect(filterUsers(sample, "all", "verified", "all")[0]?.id).toBe("1");
  });

  it("filters by photo", () => {
    expect(filterUsers(sample, "all", "all", "with_photo")).toHaveLength(1);
    expect(filterUsers(sample, "all", "all", "no_photo")).toHaveLength(1);
  });
});
