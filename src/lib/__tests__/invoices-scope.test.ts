import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    patient: { findFirst: vi.fn() },
    appointment: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/organization-invoice-access", () => ({
  getOrganizationMemberOrgIds: vi.fn(async () => []),
  userCanViewOrganizationInvoices: vi.fn(async () => true),
}));

import { prisma } from "@/lib/prisma";
import { fetchInvoicesForViewer } from "@/lib/invoices-scope";

const DOC = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchInvoicesForViewer doctorId", () => {
  it("admin may query any doctor scope", async () => {
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([] as never);

    await fetchInvoicesForViewer({
      userId: "admin-1",
      role: "admin",
      doctorId: DOC,
    });

    expect(prisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([{ user_id: DOC }]),
        }),
      })
    );
  });

  it("non-admin doctor may only query own doctorId", async () => {
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([] as never);

    await fetchInvoicesForViewer({
      userId: DOC,
      role: "doctor",
      doctorId: DOC,
    });

    expect(prisma.invoice.findMany).toHaveBeenCalled();

    vi.mocked(prisma.invoice.findMany).mockClear();
    const result = await fetchInvoicesForViewer({
      userId: DOC,
      role: "doctor",
      doctorId: OTHER,
    });

    expect(result).toEqual([]);
    expect(prisma.invoice.findMany).not.toHaveBeenCalled();
  });

  it("returns empty when both organizationId and doctorId set", async () => {
    const result = await fetchInvoicesForViewer({
      userId: "admin-1",
      role: "admin",
      organizationId: DOC,
      doctorId: OTHER,
    });

    expect(result).toEqual([]);
    expect(prisma.invoice.findMany).not.toHaveBeenCalled();
  });
});
