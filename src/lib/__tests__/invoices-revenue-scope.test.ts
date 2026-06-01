import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: {
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    appointment: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/organization-invoice-access", () => ({
  getOrganizationMemberOrgIds: vi.fn(async () => []),
}));

import { prisma } from "@/lib/prisma";
import { fetchRevenueOverviewForViewer } from "@/lib/invoices-revenue-scope";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchRevenueOverviewForViewer", () => {
  it("admin uses global invoice counts", async () => {
    vi.mocked(prisma.invoice.count)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(5);
    vi.mocked(prisma.invoice.aggregate)
      .mockResolvedValueOnce({ _sum: { amount: 59835 } } as never)
      .mockResolvedValueOnce({ _sum: { amount: 0 } } as never);

    const result = await fetchRevenueOverviewForViewer({
      userId: "admin-1",
      role: "admin",
    });

    expect(result.totalInvoices).toBe(7);
    expect(result.paidInvoices).toBe(5);
    expect(result.paidCents).toBe(59835);
    expect(prisma.invoice.count).toHaveBeenCalledWith();
  });

  it("doctor scopes revenue to visit-linked invoices", async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      { id: "appt-1" },
    ] as never);
    vi.mocked(prisma.invoice.count).mockResolvedValue(3);
    vi.mocked(prisma.invoice.aggregate).mockResolvedValue({
      _sum: { amount: 5900 },
    } as never);

    await fetchRevenueOverviewForViewer({
      userId: "doc-1",
      role: "doctor",
    });

    expect(prisma.invoice.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { user_id: "doc-1" },
            { appointment_id: { in: ["appt-1"] } },
          ]),
        }),
      })
    );
  });
});
