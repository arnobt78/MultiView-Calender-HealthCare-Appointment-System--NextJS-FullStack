"use client";

/**
 * User / Admin Management — B2B admin accounts only (email/password + Google sign-up).
 * Demo doctors/patients live on their dedicated CP management tabs.
 */

import { type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { useUsers } from "@/hooks/useUsers";
import { CP_ADMIN_USERS_FILTERS } from "@/lib/control-panel-users-filters";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
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
import { emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import {
  clinicalCellMutedTextClass,
  clinicalStackGapClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ControlPanelEntityListShell } from "@/components/control-panel/ControlPanelEntityListShell";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { isDoctorActive } from "@/lib/entity-active-status";
import type { User } from "@/types/types";
import {
  EllipsisVertical,
  Eye,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import { queryKeys } from "@/lib/query-keys";

const ADMIN_ROSTER_DEMO_NOTE = ADMIN_USER_MANAGEMENT_DEMO_NOTE;

function AdminUserStatCards({ users, isLoading }: { users: User[]; isLoading: boolean }) {
  const active = users.filter((u) => isDoctorActive(u)).length;
  const inactive = users.length - active;
  const withPhoto = users.filter((u) => u.image?.trim()).length;

  const stats = [
    {
      label: "Total Admins",
      value: users.length,
      icon: <Users className="h-4 w-4" />,
      cls: "bg-slate-50/60 border-slate-200/60",
      valueCls: "text-slate-700",
      iconCls: "bg-slate-100 border-slate-200 text-slate-600",
    },
    {
      label: "Active",
      value: active,
      icon: <UserCheck className="h-4 w-4" />,
      cls: "bg-emerald-50/60 border-emerald-200/60",
      valueCls: "text-emerald-700",
      iconCls: "bg-emerald-100 border-emerald-200 text-emerald-600",
    },
    {
      label: "Inactive",
      value: inactive,
      icon: <ShieldOff className="h-4 w-4" />,
      cls: "bg-amber-50/60 border-amber-200/60",
      valueCls: "text-amber-700",
      iconCls: "bg-amber-100 border-amber-200 text-amber-600",
    },
    {
      label: "With Photo",
      value: withPhoto,
      icon: <ShieldCheck className="h-4 w-4" />,
      cls: "bg-sky-50/60 border-sky-200/60",
      valueCls: "text-sky-700",
      iconCls: "bg-sky-100 border-sky-200 text-sky-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {stats.map(({ label, value, icon, cls, valueCls, iconCls }) => (
        <Card key={label} className={cn("rounded-[16px] border", cls)}>
          <CardContent className="p-3 flex items-center gap-2">
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl border shrink-0", iconCls)}>
              {icon}
            </span>
            <div>
              {isLoading ? (
                <Skeleton className="h-5 w-8 rounded mb-1" />
              ) : (
                <p className={cn("text-lg font-bold leading-none", valueCls)}>{value}</p>
              )}
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ActionsCell({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
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
  );
}

export default function UserManagement() {
  const { data, isLoading, isError } = useUsers(CP_ADMIN_USERS_FILTERS);
  const users = data?.users ?? [];
  const listBodyLoading = useCpListBodyLoading(
    [...queryKeys.users.all, CP_ADMIN_USERS_FILTERS],
    isLoading
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<AdminUserFormValues>(EMPTY_ADMIN_USER_FORM);

  const columns: ColumnDef<User>[] = [
    {
      id: "display_name",
      accessorFn: (row) => `${row.display_name ?? ""} ${row.email}`.trim(),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Admin" />,
      meta: { shellClassName: "min-w-[12rem]" },
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
      id: "role",
      header: "Role",
      meta: { shellClassName: "min-w-[6rem] whitespace-nowrap" },
      cell: () => <UserRoleBadge role="admin" />,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
      meta: { shellClassName: "w-[1%] whitespace-nowrap" },
      cell: ({ row }) =>
        row.original.created_at ? (
          <span className="text-xs whitespace-nowrap">
            {new Date(row.original.created_at).toLocaleDateString()}
          </span>
        ) : (
          "—"
        ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      meta: { shellClassName: "w-[1%] whitespace-nowrap text-right" },
      cell: ({ row }) => <ActionsCell user={row.original} />,
    },
  ];

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
      tone="slate"
      headerSlot={
        <ControlPanelPageChrome
          tab="users_admin"
          description="B2B admin accounts — register or Google sign-in. Demo doctors and patients are on their own management tabs."
          actions={
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className={cn(emeraldGlassPrimaryButtonClass, "cursor-pointer")}
              onClick={() => {
                setCreateForm(EMPTY_ADMIN_USER_FORM);
                setCreateDialogOpen(true);
              }}
            >
              <UserPlus className="shrink-0" aria-hidden />
              Add Admin
            </Button>
          }
        />
      }
      bannerSlot={<DemoShowcaseFeatureNote note={ADMIN_ROSTER_DEMO_NOTE} />}
      statsSlot={<AdminUserStatCards users={users} isLoading={listBodyLoading} />}
      tableSlot={
        <DataTable<User, unknown>
          columns={columns}
          data={users}
          isLoading={listBodyLoading}
          globalFilterFn={(row, q) => {
            const s = q.trim().toLowerCase();
            if (!s) return true;
            const u = row;
            return (
              (u.display_name?.toLowerCase().includes(s) ?? false) ||
              u.email.toLowerCase().includes(s)
            );
          }}
          searchPlaceholder="Search by name or email…"
          emptyMessage="No admin accounts found."
          tableClassName="min-w-[720px]"
          tableLayout="auto"
          tableFrameClassName="min-w-0 max-w-full border-0 bg-transparent shadow-none rounded-none"
        />
      }
      footerSlot={
      <>
      <CpListPaginationDevStub
        stub={CP_ADMIN_LIST_PAGINATION_STUB}
        visibleCount={users.length}
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
      />
      </>
      }
    />
  );
}
