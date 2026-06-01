import { describe, expect, it, vi, beforeEach } from "vitest";

const { findFirst } = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    organizationMember: { findFirst, findMany: vi.fn() },
  },
}));

import {
  userCanViewOrganizationInvoices,
  userCanAccessOrganizationInvoices,
} from "@/lib/organization-invoice-access";

describe("organization-invoice-access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("view allows any org member", async () => {
    findFirst.mockResolvedValue({ id: "m1" });
    const ok = await userCanViewOrganizationInvoices(
      "u1",
      "11111111-1111-4111-8111-111111111111"
    );
    expect(ok).toBe(true);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: "u1", org_id: "11111111-1111-4111-8111-111111111111" },
      })
    );
  });

  it("tag requires org admin role", async () => {
    findFirst.mockResolvedValue(null);
    const ok = await userCanAccessOrganizationInvoices(
      "u1",
      "11111111-1111-4111-8111-111111111111"
    );
    expect(ok).toBe(false);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ role: "admin" }),
      })
    );
  });
});
