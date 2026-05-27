import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  INSIGHTS_SCOPE_LABEL_NEEDS_OWNER_LOOKUP,
  INSIGHTS_SCOPE_LABEL_ORG,
  INSIGHTS_SCOPE_LABEL_OWN,
  INSIGHTS_SCOPE_LABEL_SELECTED_DOCTOR,
  fetchInsightsScopeOwnerDisplayName,
  resolveInsightsScopeLabelForMeta,
  resolveInsightsScopeLabelSync,
} from "@/lib/insights-scope-display";

const mockFindUnique = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
    },
  },
}));

describe("resolveInsightsScopeLabelSync", () => {
  const sessionId = "admin-uuid";

  it("returns Organization-wide when organizationWide", () => {
    expect(
      resolveInsightsScopeLabelSync(
        { organizationWide: true, filterOwnerId: sessionId },
        sessionId
      )
    ).toBe(INSIGHTS_SCOPE_LABEL_ORG);
  });

  it("returns My practice when filterOwnerId is session user", () => {
    expect(
      resolveInsightsScopeLabelSync(
        { organizationWide: false, filterOwnerId: sessionId },
        sessionId
      )
    ).toBe(INSIGHTS_SCOPE_LABEL_OWN);
  });

  it("returns lookup sentinel for admin doctor drill-down", () => {
    expect(
      resolveInsightsScopeLabelSync(
        { organizationWide: false, filterOwnerId: "doctor-uuid" },
        sessionId
      )
    ).toBe(INSIGHTS_SCOPE_LABEL_NEEDS_OWNER_LOOKUP);
  });
});

describe("fetchInsightsScopeOwnerDisplayName", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  it("returns display_name when present", async () => {
    mockFindUnique.mockResolvedValue({
      display_name: "Dr. Smith",
      email: "doc@example.com",
    });
    await expect(fetchInsightsScopeOwnerDisplayName("doctor-uuid")).resolves.toBe(
      "Dr. Smith"
    );
  });

  it("falls back to email then Selected doctor", async () => {
    mockFindUnique.mockResolvedValue({ display_name: null, email: "doc@example.com" });
    await expect(fetchInsightsScopeOwnerDisplayName("doctor-uuid")).resolves.toBe(
      "doc@example.com"
    );

    mockFindUnique.mockResolvedValue(null);
    await expect(fetchInsightsScopeOwnerDisplayName("doctor-uuid")).resolves.toBe(
      INSIGHTS_SCOPE_LABEL_SELECTED_DOCTOR
    );
  });
});

describe("resolveInsightsScopeLabelForMeta", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  it("does not query prisma for org-wide", async () => {
    await expect(
      resolveInsightsScopeLabelForMeta("admin-uuid", {
        organizationWide: true,
        filterOwnerId: "admin-uuid",
      })
    ).resolves.toBe(INSIGHTS_SCOPE_LABEL_ORG);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("does not query prisma for own practice", async () => {
    await expect(
      resolveInsightsScopeLabelForMeta("doctor-uuid", {
        organizationWide: false,
        filterOwnerId: "doctor-uuid",
      })
    ).resolves.toBe(INSIGHTS_SCOPE_LABEL_OWN);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("queries prisma for admin doctor drill-down", async () => {
    mockFindUnique.mockResolvedValue({
      display_name: "Dr. Jane Doe",
      email: "jane@example.com",
    });
    await expect(
      resolveInsightsScopeLabelForMeta("admin-uuid", {
        organizationWide: false,
        filterOwnerId: "doctor-uuid",
      })
    ).resolves.toBe("Dr. Jane Doe");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: "doctor-uuid" },
      select: { display_name: true, email: true },
    });
  });
});
