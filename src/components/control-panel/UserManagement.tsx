"use client";

/**
 * User / Admin Management — redesigned to match PatientManagement style.
 * Color scheme: slate/gray — distinct from doctors (sky) and patients (emerald).
 *
 * Shows all users (admin + secretary + any role), stat cards, searchable table.
 */

import { type ColumnDef } from "@tanstack/react-table";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { useUsers } from "@/hooks/useUsers";
import { CP_ALL_USERS_FILTERS } from "@/lib/control-panel-users-filters";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  clinicalCellMutedTextClass,
  clinicalStackGapClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { skyGlassTableFrameClass } from "@/lib/calendar-header-action-styles";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import type { User } from "@/types/types";
import {
  EllipsisVertical,
  Eye,
  ShieldCheck,
  ShieldQuestion,
  Users,
  UserCheck,
  UserCog,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Stat cards — shows skeleton pulse on value while data loads (no misleading zeros)
// ---------------------------------------------------------------------------
function UserStatCards({ users, isLoading }: { users: User[]; isLoading: boolean }) {
  const admins = users.filter((u) => u.role === "admin").length;
  const doctors = users.filter((u) => u.role === "doctor").length;
  const patients = users.filter((u) => u.role === "patient").length;
  const other = users.length - admins - doctors - patients;

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: <Users className="h-4 w-4" />,
      cls: "bg-slate-50/60 border-slate-200/60",
      valueCls: "text-slate-700",
      iconCls: "bg-slate-100 border-slate-200 text-slate-600",
    },
    {
      label: "Admins",
      value: admins,
      icon: <ShieldCheck className="h-4 w-4" />,
      cls: "bg-red-50/60 border-red-200/60",
      valueCls: "text-red-700",
      iconCls: "bg-red-100 border-red-200 text-red-600",
    },
    {
      label: "Doctors",
      value: doctors,
      icon: <UserCheck className="h-4 w-4" />,
      cls: "bg-sky-50/60 border-sky-200/60",
      valueCls: "text-sky-700",
      iconCls: "bg-sky-100 border-sky-200 text-sky-600",
    },
    {
      label: "Patients / Other",
      value: patients + other,
      icon: <UserCog className="h-4 w-4" />,
      cls: "bg-amber-50/60 border-amber-200/60",
      valueCls: "text-amber-700",
      iconCls: "bg-amber-100 border-amber-200 text-amber-600",
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
              {/* Only pulse the dynamic numeric value — label/icon stay stable */}
              {isLoading
                ? <Skeleton className="h-5 w-8 rounded mb-1" />
                : <p className={cn("text-lg font-bold leading-none", valueCls)}>{value}</p>
              }
              <p className="text-xs text-muted-foreground ">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role change cell
// ---------------------------------------------------------------------------
function RoleCell({ user, onRoleChange }: { user: User; onRoleChange: (id: string, role: string) => void }) {
  const ROLES = ["admin", "doctor", "patient"];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1">
          <UserRoleBadge role={user.role} />
          <ShieldCheck className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Change role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((r) => (
          <DropdownMenuItem key={r} className="capitalize" onSelect={() => onRoleChange(user.id, r)}>
            {r}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// Actions cell
// ---------------------------------------------------------------------------
function ActionsCell({ user }: { user: User }) {
  const isDoctor = user.role === "doctor";
  const detailHref = isDoctor
    ? `/control-panel/doctors/${user.id}`
    : `/control-panel/users/${user.id}`;

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
          <PrefetchingLink href={detailHref} className="flex items-center gap-2 cursor-pointer">
            <Eye className="h-4 w-4" />
            View Detail
          </PrefetchingLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// Main component — shows ALL users (not filtered by role)
// ---------------------------------------------------------------------------
export default function UserManagement() {
  const { data, isLoading, isError, updateUser } = useUsers(CP_ALL_USERS_FILTERS);
  const users = data?.users ?? [];

  const handleRoleChange = (id: string, role: string) => {
    updateUser({ id, role });
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "display_name",
      accessorFn: (row) => `${row.display_name ?? ""} ${row.email}`.trim(),
      header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
      meta: { shellClassName: "min-w-[12rem]" },
      cell: ({ row }) => {
        const u = row.original;
        const label = u.display_name ?? "—";
        const isDoctor = u.role === "doctor";
        const detailHref = isDoctor
          ? `/control-panel/doctors/${u.id}`
          : `/control-panel/users/${u.id}`;
        return (
          <div className={cn("flex min-w-0 items-center gap-2", clinicalTableCellMinRowClass)}>
            <UserAvatar
              src={u.image}
              fallbackText={u.display_name || u.email || "?"}
              sizeClassName="h-9 w-9 shrink-0"
            />
            <div className={cn("flex min-w-0 flex-col", clinicalStackGapClass)}>
              {u.id ? (
                <EntityTitleLink
                  href={detailHref}
                  label={label}
                  className="min-w-0 self-start truncate font-normal"
                />
              ) : (
                <span className="text-sm text-gray-700">{label}</span>
              )}
              <span className={cn("truncate", clinicalCellMutedTextClass)}>{u.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      meta: { shellClassName: "min-w-[8rem] whitespace-nowrap" },
      cell: ({ row }) => <RoleCell user={row.original} onRoleChange={handleRoleChange} />,
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
        <PageHeader title="User & Admin Management" description="All user accounts — admins, doctors, secretaries, patients." />
        <AppSectionErrorBanner>
          Failed to load users. Please refresh the page.
        </AppSectionErrorBanner>
      </div>
    );
  }

  return (
    <div className={controlPanelSectionRootClass}>
      <PageHeader
        title="User & Admin Management"
        description="All user accounts — admins, doctors, secretaries, patients."
      />

      <UserStatCards users={users} isLoading={isLoading} />

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
              u.email.toLowerCase().includes(s) ||
              (u.role?.toLowerCase().includes(s) ?? false)
            );
          }}
          searchPlaceholder="Search by name, email, or role…"
          emptyMessage="No users found."
          tableClassName="min-w-[860px]"
          tableLayout="auto"
        />
      </div>
    </div>
  );
}
