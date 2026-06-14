import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  invalidateDashboardOverview,
  invalidateOrganizationDetail,
  invalidateOrganizations,
} from "@/lib/query-client";
import type { OrganizationListRow } from "@/lib/organization-list-enrich";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";
import type { OrganizationDetailOrg } from "@/lib/organization-detail-load";
import {
  fetchOrganizationDetailClient,
  mergeOrganizationMemberIntoCache,
  patchOrganizationDetailOrgCache,
  removeOrganizationMemberFromCache,
} from "@/lib/organization-detail-client";
import { notify } from "@/lib/notify";
import {
  organizationCrudMessage,
  orgMemberCrudMessage,
} from "@/lib/crud-notify-messages";
import type { InitialOrgMemberInput } from "@/lib/organization-member-role";

export type CreateOrganizationInput = {
  name: string;
  initialMembers?: InitialOrgMemberInput[];
};

/** List row — enriched aggregates from GET /api/organizations. */
export type Organization = OrganizationListRow;

export type UseOrganizationDetailOptions = {
  /** SSR prefetch — stable first paint; skip mount refetch when seeded. */
  initialOrg?: OrganizationDetailOrg | null;
  initialMembers?: OrganizationDetailMemberRow[] | null;
};

/**
 * Org detail + members — subscribes to TanStack cache seeded from SSR.
 * Mirrors usePatient / useCategory detail hooks.
 */
export function useOrganizationDetail(
  orgId: string | null,
  options?: UseOrganizationDetailOptions
) {
  const queryClient = useQueryClient();
  const hasSsrSeed = options?.initialOrg != null;

  const detailQuery = useQuery({
    queryKey: queryKeys.organizations.detail(orgId ?? ""),
    queryFn: async () => {
      const data = await fetchOrganizationDetailClient(orgId!, queryClient);
      return data.org;
    },
    enabled: !!orgId,
    initialData: options?.initialOrg ?? undefined,
    staleTime: 60_000,
    refetchOnMount: hasSsrSeed ? false : true,
  });

  const membersQuery = useQuery({
    queryKey: queryKeys.organizations.members(orgId ?? ""),
    queryFn: async () => {
      const data = await fetchOrganizationDetailClient(orgId!, queryClient);
      return data.members;
    },
    enabled: !!orgId,
    initialData: options?.initialMembers ?? undefined,
    staleTime: 60_000,
    refetchOnMount: hasSsrSeed ? false : true,
  });

  return {
    org: detailQuery.data,
    members: membersQuery.data ?? [],
    isLoading: detailQuery.isLoading || membersQuery.isLoading,
    isError: detailQuery.isError || membersQuery.isError,
    error: detailQuery.error ?? membersQuery.error,
  };
}

export function useOrganization() {
  const queryClient = useQueryClient();

  const orgsInitialData = queryClient.getQueryData<Organization[]>(queryKeys.organizations.all);

  const orgsQuery = useQuery({
    queryKey: queryKeys.organizations.all,
    queryFn: async () => {
      const data = await apiClient<{ organizations: Organization[] }>("/api/organizations");
      return data.organizations || [];
    },
    initialData: orgsInitialData,
    refetchOnMount: orgsInitialData !== undefined ? false : true,
    // Org membership changes rarely; 60 s avoids redundant fetches while still
    // picking up mutations via explicit invalidateOrganizations calls.
    staleTime: 60_000,
  });

  const createOrgMutation = useMutation({
    mutationFn: (input: CreateOrganizationInput | string) => {
      const payload =
        typeof input === "string"
          ? { name: input }
          : { name: input.name, initialMembers: input.initialMembers };
      return apiClient<{ organization: Organization }>("/api/organizations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async (data) => {
      notify.crud(
        organizationCrudMessage("created", { name: data.organization.name })
      );
      await invalidateOrganizations(queryClient);
      await invalidateDashboardOverview(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to create organization"),
  });

  const addMemberMutation = useMutation({
    mutationFn: ({
      orgId,
      userId,
      role,
    }: {
      orgId: string;
      userId: string;
      role: string;
      memberLabel?: string;
    }) =>
      apiClient<{ member: OrganizationDetailMemberRow }>(
        `/api/organizations/${orgId}/members`,
        {
          method: "POST",
          body: JSON.stringify({ userId, role }),
        }
      ),
    onSuccess: async (data, variables) => {
      mergeOrganizationMemberIntoCache(queryClient, variables.orgId, data.member);
      const orgs =
        queryClient.getQueryData<Organization[]>(queryKeys.organizations.all) ?? [];
      const orgName =
        orgs.find((o) => o.id === variables.orgId)?.name ?? "Organization";
      notify.crud(
        orgMemberCrudMessage("created", {
          orgName,
          memberLabel:
            variables.memberLabel ??
            data.member.display_name ??
            data.member.email ??
            "Member",
          role: variables.role,
        })
      );
      await invalidateOrganizations(queryClient);
      await invalidateOrganizationDetail(queryClient, variables.orgId);
      await invalidateDashboardOverview(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to add member"),
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({
      orgId,
      userId,
    }: {
      orgId: string;
      userId: string;
      memberLabel?: string;
    }) =>
      apiClient(`/api/organizations/${orgId}/members`, {
        method: "DELETE",
        body: JSON.stringify({ userId }),
      }),
    onSuccess: async (_, variables) => {
      removeOrganizationMemberFromCache(queryClient, variables.orgId, variables.userId);
      const orgs =
        queryClient.getQueryData<Organization[]>(queryKeys.organizations.all) ?? [];
      const orgName =
        orgs.find((o) => o.id === variables.orgId)?.name ?? "Organization";
      notify.crud(
        orgMemberCrudMessage("deleted", {
          orgName,
          memberLabel: variables.memberLabel ?? "Member",
        })
      );
      await invalidateOrganizations(queryClient);
      await invalidateOrganizationDetail(queryClient, variables.orgId);
      await invalidateDashboardOverview(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to remove member"),
  });

  const updateOrgMutation = useMutation({
    mutationFn: ({ orgId, name }: { orgId: string; name: string }) =>
      apiClient<{ organization: Record<string, unknown> }>(
        `/api/organizations/${orgId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ name }),
        }
      ),
    onSuccess: async (data, variables) => {
      const org = data.organization;
      patchOrganizationDetailOrgCache(queryClient, variables.orgId, {
        name: typeof org.name === "string" ? org.name : variables.name,
        slug: typeof org.slug === "string" ? org.slug : undefined,
        updated_at: typeof org.updated_at === "string" ? org.updated_at : undefined,
        updated_by_id: typeof org.updated_by_id === "string" ? org.updated_by_id : null,
        updated_by_display:
          typeof org.updated_by_display === "string" ? org.updated_by_display : null,
        updated_by_email:
          typeof org.updated_by_email === "string" ? org.updated_by_email : null,
        updated_by_image:
          typeof org.updated_by_image === "string" ? org.updated_by_image : null,
        updated_by_role:
          typeof org.updated_by_role === "string" ? org.updated_by_role : null,
      });
      notify.crud(
        organizationCrudMessage("updated", { name: variables.name })
      );
      await invalidateOrganizations(queryClient);
      await invalidateOrganizationDetail(queryClient, variables.orgId);
      await invalidateDashboardOverview(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to update organization"),
  });

  const deleteOrgMutation = useMutation({
    mutationFn: (orgId: string) =>
      apiClient(`/api/organizations/${orgId}`, { method: "DELETE" }),
    onMutate: async (orgId) => {
      const orgs =
        queryClient.getQueryData<Organization[]>(queryKeys.organizations.all) ?? [];
      const deleted = orgs.find((o) => o.id === orgId) ?? null;
      return { deleted };
    },
    onSuccess: async (_, _orgId, context) => {
      const name = context?.deleted?.name ?? "Organization";
      notify.crud(organizationCrudMessage("deleted", { name }));
      await invalidateOrganizations(queryClient);
      await invalidateOrganizationDetail(queryClient, _orgId);
      await invalidateDashboardOverview(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to delete organization"),
  });

  return {
    organizations: orgsQuery.data || [],
    isLoading: orgsQuery.isLoading,
    isError: orgsQuery.isError,
    error: orgsQuery.error,
    createOrg: createOrgMutation.mutate,
    isCreating: createOrgMutation.isPending,
    addMember: addMemberMutation.mutate,
    isAddingMember: addMemberMutation.isPending,
    removeMember: removeMemberMutation.mutate,
    removeMemberAsync: removeMemberMutation.mutateAsync,
    isRemovingMember: removeMemberMutation.isPending,
    deleteOrg: deleteOrgMutation.mutate,
    deleteOrgAsync: deleteOrgMutation.mutateAsync,
    isDeleting: deleteOrgMutation.isPending,
    updateOrg: updateOrgMutation.mutate,
    isUpdating: updateOrgMutation.isPending,
  };
}
