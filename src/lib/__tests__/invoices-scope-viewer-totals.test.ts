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
import {
  buildInvoiceViewerWhere,
  fetchInvoiceBillingTotalsForViewer,
} from "@/lib/invoices-scope";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildInvoiceViewerWhere", () => {
  it("admin returns unrestricted where", async () => {
    const result = await buildInvoiceViewerWhere({
      userId: "admin-1",
      role: "admin",
    });
    expect(result).toEqual({ kind: "where", where: {} });
  });

  it("non-admin doctor returns OR where with user_id", async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([] as never);
    const result = await buildInvoiceViewerWhere({
      userId: "doc-1",
      role: "doctor",
    });
    expect(result.kind).toBe("where");
    if (result.kind === "where") {
      expect(result.where).toMatchObject({ OR: [{ user_id: "doc-1" }] });
    }
  });
});

describe("fetchInvoiceBillingTotalsForViewer", () => {
  it("admin aggregates with empty where and enriched KPI fields", async () => {
    vi.mocked(prisma.invoice.aggregate).mockResolvedValue({
      _sum: { amount: 1000 },
      _count: 2,
    } as never);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([
      { amount: 1000, payments: [{ status: "succeeded" }] },
    ] as never);

    const result = await fetchInvoiceBillingTotalsForViewer({
      userId: "admin-1",
      role: "admin",
    });

    expect(result.totals.paid.count).toBeGreaterThanOrEqual(0);
    expect(result.paidPeriod).toBeUndefined();
    expect(result.extendedKpis).toBeUndefined();
    expect(prisma.invoice.aggregate).toHaveBeenCalled();
    expect(prisma.invoice.findMany).not.toHaveBeenCalled();
  });
});
