/**
 * Client-side org detail fetch + TanStack cache merges — mirrors patient detail cache helpers.
 * Single GET populates both `organizations.detail` and `organizations.members` keys.
 */

import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type {
  OrganizationDetailOrg,
  OrganizationDetailPayload,
} from "@/lib/organization-detail-load";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";

/** Dedupes parallel refetches when detail + members hooks mount together after invalidation. */
const inflightByOrgId = new Map<string, Promise<OrganizationDetailPayload>>();

/** GET /api/organizations/:id — writes both detail and members cache keys. */
export async function fetchOrganizationDetailClient(
  orgId: string,
  queryClient: QueryClient
): Promise<OrganizationDetailPayload> {
  const cachedOrg = queryClient.getQueryData<OrganizationDetailOrg>(
    queryKeys.organizations.detail(orgId)
  );
  const cachedMembers = queryClient.getQueryData<OrganizationDetailMemberRow[]>(
    queryKeys.organizations.members(orgId)
  );
  if (cachedOrg != null && cachedMembers != null) {
    return { org: cachedOrg, members: cachedMembers };
  }

  const existing = inflightByOrgId.get(orgId);
  if (existing) return existing;

  const request = apiClient<OrganizationDetailPayload>(`/api/organizations/${orgId}`).then(
    (data) => {
      queryClient.setQueryData(queryKeys.organizations.detail(orgId), data.org);
      queryClient.setQueryData(queryKeys.organizations.members(orgId), data.members);
      inflightByOrgId.delete(orgId);
      return data;
    },
    (err) => {
      inflightByOrgId.delete(orgId);
      throw err;
    }
  );
  inflightByOrgId.set(orgId, request);
  return request;
}

/** Append enriched member after POST — instant table row before background invalidation refetch. */
export function mergeOrganizationMemberIntoCache(
  queryClient: QueryClient,
  orgId: string,
  member: OrganizationDetailMemberRow
): void {
  queryClient.setQueryData<OrganizationDetailMemberRow[]>(
    queryKeys.organizations.members(orgId),
    (old) => {
      const list = old ?? [];
      if (list.some((m) => m.user_id === member.user_id)) return list;
      return [...list, member];
    }
  );
}

/** Remove member row immediately after DELETE — detail hook re-renders without local state. */
export function removeOrganizationMemberFromCache(
  queryClient: QueryClient,
  orgId: string,
  userId: string
): void {
  queryClient.setQueryData<OrganizationDetailMemberRow[]>(
    queryKeys.organizations.members(orgId),
    (old) => (old ?? []).filter((m) => m.user_id !== userId)
  );
}

/** Patch org fields after PATCH — instant title + audit card until invalidation refetch. */
export function patchOrganizationDetailOrgCache(
  queryClient: QueryClient,
  orgId: string,
  patch: Partial<OrganizationDetailOrg>
): void {
  queryClient.setQueryData<OrganizationDetailOrg>(
    queryKeys.organizations.detail(orgId),
    (old) => (old ? { ...old, ...patch } : old)
  );
}

/** Test-only — reset in-flight dedupe between cases. */
export function resetOrganizationDetailClientInflightForTests(): void {
  inflightByOrgId.clear();
}
