import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  fetchPaidRevenueCentsByDoctorIds,
  resolveDoctorPaidRevenueCents,
} from "@/lib/doctor-revenue-aggregate";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: {
      groupBy: vi.fn(),
    },
  },
}));

describe("doctor-revenue-aggregate", () => {
  beforeEach(() => {
    vi.mocked(prisma.invoice.groupBy).mockReset();
  });

  it("fetchPaidRevenueCentsByDoctorIds returns empty map for no ids", async () => {
    const map = await fetchPaidRevenueCentsByDoctorIds([]);
    expect(map.size).toBe(0);
    expect(prisma.invoice.groupBy).not.toHaveBeenCalled();
  });

  it("fetchPaidRevenueCentsByDoctorIds maps paid invoice sums per doctor", async () => {
    vi.mocked(prisma.invoice.groupBy).mockResolvedValue([
      { user_id: "doc-a", _sum: { amount: 12500 } },
      { user_id: "doc-b", _sum: { amount: null } },
    ] as never);

    const map = await fetchPaidRevenueCentsByDoctorIds(["doc-a", "doc-b", "doc-c"]);

    expect(prisma.invoice.groupBy).toHaveBeenCalledWith({
      by: ["user_id"],
      where: {
        user_id: { in: ["doc-a", "doc-b", "doc-c"] },
        status: "paid",
      },
      _sum: { amount: true },
    });
    expect(map.get("doc-a")).toBe(12500);
    expect(map.get("doc-b")).toBe(0);
    expect(map.has("doc-c")).toBe(false);
  });

  it("resolveDoctorPaidRevenueCents defaults missing doctor to 0", () => {
    const map = new Map([["doc-a", 5000]]);
    expect(resolveDoctorPaidRevenueCents("doc-a", map)).toBe(5000);
    expect(resolveDoctorPaidRevenueCents("doc-missing", map)).toBe(0);
  });
});
