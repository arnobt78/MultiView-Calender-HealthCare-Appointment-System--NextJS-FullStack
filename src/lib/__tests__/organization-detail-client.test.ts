import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchOrganizationDetailClient,
  mergeOrganizationMemberIntoCache,
  patchOrganizationDetailOrgCache,
  removeOrganizationMemberFromCache,
  resetOrganizationDetailClientInflightForTests,
} from "@/lib/organization-detail-client";
import type { OrganizationDetailOrg } from "@/lib/organization-detail-load";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

import { apiClient } from "@/lib/api-client";

const orgId = "org-11111111-1111-1111-1111-111111111111";

const baseOrg: OrganizationDetailOrg = {
  id: orgId,
  created_at: "2026-01-01T00:00:00.000Z",
  name: "Clinic",
  slug: "clinic",
  owner_user_id: "u1",
  owner_label: "Owner",
  viewer_role: "admin",
};

const memberA: OrganizationDetailMemberRow = {
  id: "m1",
  org_id: orgId,
  user_id: "u2",
  role: "doctor",
  joined_at: "2026-01-02T00:00:00.000Z",
  display_name: "Dr A",
  email: "a@test.com",
};

const memberB: OrganizationDetailMemberRow = {
  id: "m2",
  org_id: orgId,
  user_id: "u3",
  role: "patient",
  joined_at: "2026-01-03T00:00:00.000Z",
  display_name: "Pat B",
  email: "b@test.com",
};

describe("organization-detail-client", () => {
  beforeEach(() => {
    vi.mocked(apiClient).mockReset();
    resetOrganizationDetailClientInflightForTests();
  });

  it("mergeOrganizationMemberIntoCache appends when user_id absent", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.organizations.members(orgId), [memberA]);
    mergeOrganizationMemberIntoCache(qc, orgId, memberB);
    expect(qc.getQueryData(queryKeys.organizations.members(orgId))).toEqual([
      memberA,
      memberB,
    ]);
  });

  it("mergeOrganizationMemberIntoCache skips duplicate user_id", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.organizations.members(orgId), [memberA]);
    mergeOrganizationMemberIntoCache(qc, orgId, { ...memberA, id: "m1-dup" });
    expect(qc.getQueryData(queryKeys.organizations.members(orgId))).toEqual([memberA]);
  });

  it("removeOrganizationMemberFromCache filters by user_id", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.organizations.members(orgId), [memberA, memberB]);
    removeOrganizationMemberFromCache(qc, orgId, memberA.user_id);
    expect(qc.getQueryData(queryKeys.organizations.members(orgId))).toEqual([memberB]);
  });

  it("patchOrganizationDetailOrgCache updates name and slug", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.organizations.detail(orgId), baseOrg);
    patchOrganizationDetailOrgCache(qc, orgId, { name: "New Name", slug: "new-name" });
    expect(qc.getQueryData(queryKeys.organizations.detail(orgId))).toEqual({
      ...baseOrg,
      name: "New Name",
      slug: "new-name",
    });
  });

  it("fetchOrganizationDetailClient returns warm cache without network", async () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.organizations.detail(orgId), baseOrg);
    qc.setQueryData(queryKeys.organizations.members(orgId), [memberA]);
    const data = await fetchOrganizationDetailClient(orgId, qc);
    expect(data).toEqual({ org: baseOrg, members: [memberA] });
    expect(apiClient).not.toHaveBeenCalled();
  });

  it("fetchOrganizationDetailClient dedupes parallel in-flight requests", async () => {
    const qc = new QueryClient();
    let resolveFetch!: (value: { org: OrganizationDetailOrg; members: OrganizationDetailMemberRow[] }) => void;
    const pending = new Promise<{ org: OrganizationDetailOrg; members: OrganizationDetailMemberRow[] }>(
      (resolve) => {
        resolveFetch = resolve;
      }
    );
    vi.mocked(apiClient).mockReturnValueOnce(pending as never);

    const p1 = fetchOrganizationDetailClient(orgId, qc);
    const p2 = fetchOrganizationDetailClient(orgId, qc);
    expect(apiClient).toHaveBeenCalledTimes(1);

    resolveFetch({ org: baseOrg, members: [memberA] });
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual({ org: baseOrg, members: [memberA] });
    expect(r2).toEqual(r1);
    expect(qc.getQueryData(queryKeys.organizations.detail(orgId))).toEqual(baseOrg);
    expect(qc.getQueryData(queryKeys.organizations.members(orgId))).toEqual([memberA]);
  });
});
