"use client";

/**
 * User / Admin Management — B2B admin accounts only (email/password + Google sign-up).
 * Demo doctors/patients live on their dedicated CP management tabs.
 */

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { useUsers } from "@/hooks/useUsers";
import { CP_ADMIN_USERS_FILTERS } from "@/lib/control-panel-users-filters";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { ControlPanelHeaderGlassButton } from "@/components/control-panel/ControlPanelHeaderGlassButton";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityActiveStatusBadge } from "@/components/shared/entity-display/EntityActiveStatusBadge";
import { DemoShowcaseFeatureNote } from "@/components/shared/DemoShowcaseFeatureNote";
import { ADMIN_USER_MANAGEMENT_DEMO_NOTE } from "@/lib/demo-showcase-copy";
import { AdminUserFormDialog } from "@/components/control-panel/admin-user-dialog/AdminUserFormDialog";
import { CpListPaginationDevStub } from "@/components/shared/control-panel/CpListPaginationDevStub";
import {
  CP_ADMIN_CREATE_STUB,
  CP_ADMIN_LIST_PAGINATION_STUB,
} from "@/lib/cp-dev-stub-copy";
import {
  EMPTY_ADMIN_USER_FORM,
  type AdminUserFormValues,
} from "@/lib/admin-user-form-state";
import { violetGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import {
  cpClinicalListTableFrameClassName,
  cpClinicalListIdentityColumnShellClass,
  cpClinicalListPhoneColumnShellClass,
  cpClinicalListJoinedColumnShellClass,
  cpClinicalListActionsColumnShellClass,
} from "@/lib/cp-clinical-list-table-classes";
import {
  clinicalCellMutedTextClass,
  clinicalStackGapClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ControlPanelEntityListShell } from "@/components/control-panel/ControlPanelEntityListShell";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { isUserAccountActive } from "@/lib/entity-active-status";
import type { User } from "@/types/types";
import { EllipsisVertical, Eye, ImageIcon, ListFilter, ShieldCheck, UserPlus } from "lucide-react";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import { queryKeys } from "@/lib/query-keys";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { APP_INNER_SCROLL_STICKY_TOP_CLASS } from "@/lib/portal-z-index";
import {
  AdminUserListFiltersProvider,
  useAdminUserListFilters,
  type AdminUserPhotoFilter,
  type AdminUserStatusFilter,
  type AdminUserVerificationFilter,
} from "@/components/control-panel/AdminUserListFiltersContext";
import { AdminUserManagementStatsRow } from "@/components/control-panel/AdminUserManagementStatsRow";

const ADMIN_ROSTER_DEMO_NOTE = ADMIN_USER_MANAGEMENT_DEMO_NOTE;

const STATUS_FILTER_LABEL: Record<AdminUserStatusFilter, string> = {
  all: "All Statuses",
  active: "Active",
  inactive: "Inactive",
};

const VERIFICATION_FILTER_LABEL: Record<AdminUserVerificationFilter, string> = {
  all: "All Verification",
  verified: "Verified",
  unverified: "Unverified",
};

const PHOTO_FILTER_LABEL: Record<AdminUserPhotoFilter, string> = {
  all: "All Photos",
  with_photo: "With Photo",
  no_photo: "No Photo",
};

function ActionsCell({ user }: { user: User }) {
  return (
    <div className="flex min-h-[2.75rem] items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
            <EllipsisVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <PrefetchingLink
              href={`/control-panel/users/${user.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              View Detail
            </PrefetchingLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function UserManagementInner() {
  const { data, isLoading, isError } = useUsers(CP_ADMIN_USERS_FILTERS);
  const users = data?.users ?? [];
  const listBodyLoading = useCpListBodyLoading(
    [...queryKeys.users.all, CP_ADMIN_USERS_FILTERS],
    isLoading
  );

  const { status, setStatus, verification, setVerification, photo, setPhoto, filterUsers } =
    useAdminUserListFilters();
  const filteredUsers = filterUsers(users);

  const [listSearch, setListSearch] = useState("");
  const hasToolbarFilters = useMemo(
    () =>
      listSearch.trim().length > 0 ||
      status !== "all" ||
      verification !== "all" ||
      photo !== "all",
    [listSearch, status, verification, photo]
  );
  const resetToolbar = () => {
    setListSearch("");
    setStatus("all");
    setVerification("all");
    setPhoto("all");
  };

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<AdminUserFormValues>(EMPTY_ADMIN_USER_FORM);

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        id: "display_name",
        accessorFn: (row) => `${row.display_name ?? ""} ${row.email}`.trim(),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Admin" />,
        meta: { shellClassName: cpClinicalListIdentityColumnShellClass },
        cell: ({ row }) => {
          const u = row.original;
          const label = u.display_name ?? "—";
          return (
            <div className={cn("flex min-w-0 items-center gap-2", clinicalTableCellMinRowClass)}>
              <UserAvatar
                src={u.image}
                fallbackText={u.display_name || u.email || "?"}
                sizeClassName="h-9 w-9 shrink-0"
              />
              <div className={cn("flex min-w-0 flex-col", clinicalStackGapClass)}>
                <EntityTitleLink
                  href={`/control-panel/users/${u.id}`}
                  label={label}
                  className="min-w-0 self-start truncate font-normal"
                />
                <span className={cn("truncate", clinicalCellMutedTextClass)}>{u.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "phone",
        accessorFn: (row) => row.phone ?? "",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
        meta: { shellClassName: cpClinicalListPhoneColumnShellClass },
        cell: ({ row }) => {
          const phone = row.original.phone?.trim();
          return (
            <div className="flex min-h-[2.75rem] items-center">
              {phone ? (
                <span className={cn("truncate", clinicalCellMutedTextClass)} title={phone}>
                  {phone}
                </span>
              ) : (
                <span className={clinicalCellMutedTextClass}>—</span>
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        accessorFn: (row) => (isUserAccountActive(row) ? "active" : "inactive"),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        meta: { shellClassName: "w-[10%] min-w-[7.25rem] whitespace-nowrap" },
        cell: ({ row }) => (
          <div className="flex min-h-[2.75rem] items-center">
            <EntityActiveStatusBadge active={isUserAccountActive(row.original)} />
          </div>
        ),
      },
      {
        id: "role",
        accessorFn: (row) => row.role ?? "admin",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        meta: { shellClassName: "w-[8%] min-w-[6rem] whitespace-nowrap" },
        cell: () => (
          <div className="flex min-h-[2.75rem] items-center">
            <UserRoleBadge role="admin" />
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
        meta: { shellClassName: cpClinicalListJoinedColumnShellClass },
        cell: ({ row }) => (
          <div className="flex min-h-[2.75rem] items-center">
            <span className={cn("whitespace-nowrap text-xs", clinicalCellMutedTextClass)}>
              {row.original.created_at
                ? format(new Date(row.original.created_at), "MMM d, yyyy")
                : "—"}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" className="text-right" />
        ),
        enableSorting: false,
        meta: { shellClassName: cpClinicalListActionsColumnShellClass },
        cell: ({ row }) => <ActionsCell user={row.original} />,
      },
    ],
    []
  );

  if (isError) {
    return (
      <div className={controlPanelSectionRootClass}>
        <ControlPanelPageChrome tab="users_admin" />
        <AppSectionErrorBanner>
          Failed to load admin users. Please refresh the page.
        </AppSectionErrorBanner>
      </div>
    );
  }

  return (
    <ControlPanelEntityListShell
      tone="violet"
      headerSlot={
        <ControlPanelPageChrome
          tab="users_admin"
          actions={
            <ControlPanelHeaderGlassButton
              glassClassName={violetGlassPrimaryButtonClass}
              icon={UserPlus}
              onClick={() => {
                setCreateForm(EMPTY_ADMIN_USER_FORM);
                setCreateDialogOpen(true);
              }}
            >
              Add Admin
            </ControlPanelHeaderGlassButton>
          }
        />
      }
      bannerSlot={<DemoShowcaseFeatureNote note={ADMIN_ROSTER_DEMO_NOTE} />}
      statsSlot={
        <AdminUserManagementStatsRow users={users} valueSkeleton={listBodyLoading} />
      }
      toolbarSlot={
        <ClinicalListFilterToolbar
          stickyClassName={APP_INNER_SCROLL_STICKY_TOP_CLASS}
          search={{
            value: listSearch,
            onChange: setListSearch,
            placeholder: "Search… (name, email, or phone)",
            ariaLabel: "Search admin users by name, email, or phone",
          }}
          showReset={hasToolbarFilters}
          onReset={resetToolbar}
        >
          <FilterSelect
            value={status}
            onValueChange={(v) => setStatus(v as AdminUserStatusFilter)}
            displayLabel={STATUS_FILTER_LABEL[status]}
            icon={ListFilter}
            size="toolbar"
            triggerClassName="max-w-[200px]"
            ariaLabel="Filter by status"
            options={[
              { value: "all", label: STATUS_FILTER_LABEL.all },
              { value: "active", label: STATUS_FILTER_LABEL.active },
              { value: "inactive", label: STATUS_FILTER_LABEL.inactive },
            ]}
          />
          <FilterSelect
            value={verification}
            onValueChange={(v) => setVerification(v as AdminUserVerificationFilter)}
            displayLabel={VERIFICATION_FILTER_LABEL[verification]}
            icon={ShieldCheck}
            size="toolbar"
            triggerClassName="max-w-[220px]"
            ariaLabel="Filter by email verification"
            options={[
              { value: "all", label: VERIFICATION_FILTER_LABEL.all },
              { value: "verified", label: VERIFICATION_FILTER_LABEL.verified },
              { value: "unverified", label: VERIFICATION_FILTER_LABEL.unverified },
            ]}
          />
          <FilterSelect
            value={photo}
            onValueChange={(v) => setPhoto(v as AdminUserPhotoFilter)}
            displayLabel={PHOTO_FILTER_LABEL[photo]}
            icon={ImageIcon}
            size="toolbar"
            triggerClassName="max-w-[200px]"
            ariaLabel="Filter by profile photo"
            options={[
              { value: "all", label: PHOTO_FILTER_LABEL.all },
              { value: "with_photo", label: PHOTO_FILTER_LABEL.with_photo },
              { value: "no_photo", label: PHOTO_FILTER_LABEL.no_photo },
            ]}
          />
        </ClinicalListFilterToolbar>
      }
      tableSlot={
        <DataTable<User, unknown>
          columns={columns}
          data={filteredUsers}
          isLoading={listBodyLoading}
          externalGlobalFilter={{ value: listSearch, onChange: setListSearch }}
          globalFilterFn={(row, q) => {
            const s = q.trim().toLowerCase();
            if (!s) return true;
            const u = row;
            return (
              (u.display_name?.toLowerCase().includes(s) ?? false) ||
              u.email.toLowerCase().includes(s) ||
              (u.phone?.toLowerCase().includes(s) ?? false)
            );
          }}
          emptyMessage="No admin accounts found."
          tableClassName="min-w-[1080px] w-full"
          tableFrameClassName={cpClinicalListTableFrameClassName}
        />
      }
      footerSlot={
        <>
          <CpListPaginationDevStub
            stub={CP_ADMIN_LIST_PAGINATION_STUB}
            visibleCount={filteredUsers.length}
            pagination={data?.pagination ?? null}
          />

          <AdminUserFormDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            readOnlyEmail="new.admin@example.com"
            form={createForm}
            onFormChange={(patch) => setCreateForm((p) => ({ ...p, ...patch }))}
            onSubmit={() => undefined}
            mode="create"
            devStub={CP_ADMIN_CREATE_STUB}
            emailVerified={false}
          />
        </>
      }
    />
  );
}

export default function UserManagement() {
  return (
    <AdminUserListFiltersProvider>
      <UserManagementInner />
    </AdminUserListFiltersProvider>
  );
}
