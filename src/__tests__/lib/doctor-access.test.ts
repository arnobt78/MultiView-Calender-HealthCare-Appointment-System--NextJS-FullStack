import { describe, expect, it, vi, beforeEach } from "vitest";
import { canViewDoctorPortalProfile } from "@/lib/doctor-access";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("canViewDoctorPortalProfile", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findFirst).mockReset();
  });

  it("allows admin without db lookup", async () => {
    const ok = await canViewDoctorPortalProfile(
      { userId: "a1", email: "a@test.com", role: "admin" },
      "d1"
    );
    expect(ok).toBe(true);
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it("allows patient when target is a doctor user", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: "d1" } as never);
    const ok = await canViewDoctorPortalProfile(
      { userId: "p1", email: "p@test.com", role: "patient" },
      "d1"
    );
    expect(ok).toBe(true);
  });

  it("denies when target is not a doctor user", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    const ok = await canViewDoctorPortalProfile(
      { userId: "p1", email: "p@test.com", role: "patient" },
      "bad"
    );
    expect(ok).toBe(false);
  });
});
