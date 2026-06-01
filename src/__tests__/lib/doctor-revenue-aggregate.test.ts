import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  fetchPaidRevenueCentsByDoctorIds,
  resolveDoctorPaidRevenueCents,
} from "@/lib/doctor-revenue-aggregate";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: {
      findMany: vi.fn(),
    },
  },
}));

describe("doctor-revenue-aggregate", () => {
  beforeEach(() => {
    vi.mocked(prisma.invoice.findMany).mockReset();
  });

  it("fetchPaidRevenueCentsByDoctorIds returns empty map for no ids", async () => {
    const map = await fetchPaidRevenueCentsByDoctorIds([]);
    expect(map.size).toBe(0);
    expect(prisma.invoice.findMany).not.toHaveBeenCalled();
  });

  it("credits treating physician when billing user is calendar owner", async () => {
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([
      {
        amount: 5900,
        user_id: "doc-owner",
        appointment: {
          owner_id: "doc-owner",
          treating_physician_id: "doc-a",
        },
      },
    ] as never);

    const map = await fetchPaidRevenueCentsByDoctorIds(["doc-a", "doc-owner"]);
    expect(map.get("doc-a")).toBe(5900);
    expect(map.get("doc-owner")).toBe(0);
  });

  it("resolveDoctorPaidRevenueCents defaults missing doctor to 0", () => {
    const map = new Map([["doc-a", 5000]]);
    expect(resolveDoctorPaidRevenueCents("doc-a", map)).toBe(5000);
    expect(resolveDoctorPaidRevenueCents("doc-missing", map)).toBe(0);
  });
});
