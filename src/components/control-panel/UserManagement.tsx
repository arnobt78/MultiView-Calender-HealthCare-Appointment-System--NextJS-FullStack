"use client";

/**
 * User / Admin Management — B2B admin accounts only (email/password + Google sign-up).
 * Demo doctors/patients live on their dedicated CP management tabs.
 */

import { type ColumnDef } from "@tanstack/react-table";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { useUsers } from "@/hooks/useUsers";
import { CP_ADMIN_USERS_FILTERS } from "@/lib/control-panel-users-filters";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { DemoShowcaseFeatureNote } from "@/components/shared/DemoShowcaseFeatureNote";
import { ADMIN_USER_MANAGEMENT_DEMO_NOTE } from "@/lib/demo-showcase-copy";
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
import { skyGlassTableFrameClass } from "@/lib/calendar-header-action-styles";
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
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
        <PageHeader
          title="User & Admin Management"
          description="B2B admin accounts — register or Google sign-in."
        />
        <AppSectionErrorBanner>
          Failed to load admin users. Please refresh the page.
        </AppSectionErrorBanner>
      </div>
    );
  }

  return (
    <div className={controlPanelSectionRootClass}>
      <PageHeader
        title="User & Admin Management"
        description="B2B admin accounts — register or Google sign-in. Demo doctors and patients are on their own management tabs."
      />

      <DemoShowcaseFeatureNote note={ADMIN_ROSTER_DEMO_NOTE} />

      <AdminUserStatCards users={users} isLoading={isLoading} />

      <div className={cn("rounded-2xl overflow-hidden", skyGlassTableFrameClass)}>
        <DataTable<User, unknown>
          columns={columns}
          data={users}
          isLoading={isLoading}
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
        />
      </div>
    </div>
  );
}
