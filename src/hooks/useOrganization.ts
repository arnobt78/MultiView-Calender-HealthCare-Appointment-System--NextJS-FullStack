import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  invalidateDashboardOverview,
  invalidateOrganizationDetail,
  invalidateOrganizations,
} from "@/lib/query-client";
import type { OrganizationListRow } from "@/lib/organization-list-enrich";

/** List row — enriched aggregates from GET /api/organizations. */
export type Organization = OrganizationListRow;
import { notify } from "@/lib/notify";
import {
  organizationCrudMessage,
  orgMemberCrudMessage,
} from "@/lib/crud-notify-messages";

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: string;
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
    mutationFn: (name: string) =>
      apiClient<{ organization: Organization }>("/api/organizations", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
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
      apiClient(`/api/organizations/${orgId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId, role }),
      }),
    onSuccess: async (_, variables) => {
      const orgs =
        queryClient.getQueryData<Organization[]>(queryKeys.organizations.all) ?? [];
      const orgName =
        orgs.find((o) => o.id === variables.orgId)?.name ?? "Organization";
      notify.crud(
        orgMemberCrudMessage("created", {
          orgName,
          memberLabel: variables.memberLabel ?? "Member",
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
      apiClient<{ organization: Organization }>(`/api/organizations/${orgId}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    onSuccess: async (_, variables) => {
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
    isRemovingMember: removeMemberMutation.isPending,
    deleteOrg: deleteOrgMutation.mutate,
    isDeleting: deleteOrgMutation.isPending,
    updateOrg: updateOrgMutation.mutate,
    isUpdating: updateOrgMutation.isPending,
  };
}
