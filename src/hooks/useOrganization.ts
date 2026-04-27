import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAllForCrud } from "@/lib/query-client";
import { notify } from "@/lib/notify";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string;
  role: string;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export function useOrganization() {
  const queryClient = useQueryClient();

  const orgsQuery = useQuery({
    queryKey: queryKeys.organizations.all,
    queryFn: async () => {
      const data = await apiClient<{ organizations: Organization[] }>("/api/organizations");
      return data.organizations || [];
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: (name: string) =>
      apiClient("/api/organizations", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      notify.crud({ action: "created", entity: "Organization", detail: "A new organization was created." });
      invalidateAllForCrud(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to create organization"),
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ orgId, userId, role }: { orgId: string; userId: string; role: string }) =>
      apiClient(`/api/organizations/${orgId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId, role }),
      }),
    onSuccess: () => {
      notify.success({ title: "Member added", subtitle: "The member now has organization access." });
      invalidateAllForCrud(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to add member"),
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ orgId, userId }: { orgId: string; userId: string }) =>
      apiClient(`/api/organizations/${orgId}/members`, {
        method: "DELETE",
        body: JSON.stringify({ userId }),
      }),
    onSuccess: () => {
      notify.warning({ title: "Member removed", subtitle: "The user no longer has organization access." });
      invalidateAllForCrud(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to remove member"),
  });

  const deleteOrgMutation = useMutation({
    mutationFn: (orgId: string) =>
      apiClient(`/api/organizations/${orgId}`, { method: "DELETE" }),
    onSuccess: () => {
      notify.crud({ action: "deleted", entity: "Organization", detail: "The organization was deleted." });
      invalidateAllForCrud(queryClient);
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
  };
}
