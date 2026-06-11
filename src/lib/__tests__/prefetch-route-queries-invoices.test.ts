import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

const apiClient = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: (...args: unknown[]) => apiClient(...args),
}));

import { prefetchQueriesForDetailHref } from "@/lib/prefetch-route-queries";

describe("prefetchQueriesForDetailHref invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.mockResolvedValue({
      invoice: {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        user_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        amount: 1000,
        currency: "eur",
        status: "sent",
        created_at: "2026-01-01T00:00:00.000Z",
        payments: [],
      },
    });
  });

  it.each([
    ["/invoices/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"],
    ["/control-panel/invoices/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"],
  ])("prefetches invoice detail for %s", async (href) => {
    const qc = new QueryClient();
    prefetchQueriesForDetailHref(qc, href);
    await vi.waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith(
        "/api/invoices/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
      );
    });
    await vi.waitFor(() => {
      expect(
        qc.getQueryData(
          queryKeys.invoices.detail("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
        )
      ).toBeTruthy();
    });
  });
});

describe("prefetchQueriesForDetailHref doctors (patient RBAC)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.mockResolvedValue({ snapshot: {} });
  });

  it("skips GET /api/users/:id for patient viewers — warms doctor snapshot only", async () => {
    const doctorId = "4f9ab5e7-7d89-4add-9b3b-ae017c11ec25";
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.auth.me, { id: "patient-1", role: "patient" });

    prefetchQueriesForDetailHref(qc, `/doctors/${doctorId}`);

    await vi.waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith(`/api/doctors/${doctorId}/snapshot`);
    });
    expect(apiClient).not.toHaveBeenCalledWith(`/api/users/${doctorId}`);
  });
});

describe("prefetchQueriesForDetailHref organizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prefetches org detail + members from enriched GET", async () => {
    const orgId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const detail = {
      org: {
        id: orgId,
        name: "Clinic",
        slug: "clinic",
        owner_user_id: "u1",
        owner_label: "Owner",
        created_at: "2026-01-01T00:00:00.000Z",
      },
      members: [
        {
          id: "m1",
          org_id: orgId,
          user_id: "u1",
          role: "admin",
          joined_at: "2026-01-01T00:00:00.000Z",
          display_name: "Owner",
          email: null,
        },
      ],
    };
    apiClient.mockResolvedValue(detail);
    const qc = new QueryClient();
    prefetchQueriesForDetailHref(qc, `/control-panel/organizations/${orgId}`);
    await vi.waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith(`/api/organizations/${orgId}`);
    });
    await vi.waitFor(() => {
      expect(qc.getQueryData(queryKeys.organizations.detail(orgId))).toEqual(detail.org);
      expect(qc.getQueryData(queryKeys.organizations.members(orgId))).toEqual(detail.members);
    });
  });
});
