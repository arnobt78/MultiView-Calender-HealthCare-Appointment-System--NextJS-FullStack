import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  appointmentOwnerWhere,
  buildInsightsScopeBases,
} from "@/lib/insights/insights-aggregate";
import { buildDoctorScopedInvoiceWhere } from "@/lib/invoices-revenue-scope";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/invoices-revenue-scope", () => ({
  buildDoctorScopedInvoiceWhere: vi.fn(),
}));

describe("insights scope bases", () => {
  beforeEach(() => {
    vi.mocked(prisma.appointment.findMany).mockReset();
    vi.mocked(buildDoctorScopedInvoiceWhere).mockReset();
  });

  it("personal appointment scope includes owner and treating physician", () => {
    const base = appointmentOwnerWhere({
      organizationWide: false,
      filterOwnerId: "doc-a",
    });
    expect(base).toEqual({
      OR: [{ owner_id: "doc-a" }, { treating_physician_id: "doc-a" }],
    });
  });

  it("buildInsightsScopeBases uses doctor invoice OR for personal scope", async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([{ id: "appt-1" }] as never);
    vi.mocked(buildDoctorScopedInvoiceWhere).mockResolvedValue({
      OR: [{ user_id: "doc-a" }, { appointment_id: { in: ["appt-1"] } }],
    });

    const bases = await buildInsightsScopeBases({
      organizationWide: false,
      filterOwnerId: "doc-a",
    });

    expect(bases.apptBase.OR).toHaveLength(2);
    expect(bases.invoiceBase).toEqual({
      OR: [{ user_id: "doc-a" }, { appointment_id: { in: ["appt-1"] } }],
    });
    expect(buildDoctorScopedInvoiceWhere).toHaveBeenCalledWith("doc-a");
  });

  it("organization-wide uses empty invoice filter", async () => {
    const bases = await buildInsightsScopeBases({
      organizationWide: true,
      filterOwnerId: "admin-1",
    });
    expect(bases.invoiceBase).toEqual({});
    expect(buildDoctorScopedInvoiceWhere).not.toHaveBeenCalled();
  });
});
