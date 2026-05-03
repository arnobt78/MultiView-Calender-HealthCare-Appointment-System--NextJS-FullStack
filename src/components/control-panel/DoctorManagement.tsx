"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { useUsers } from "@/hooks/useUsers";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types/types";
import { EllipsisVertical, Eye, Pencil, ShieldCheck } from "lucide-react";

function RoleCell({ user, onRoleChange }: { user: User; onRoleChange: (id: string, role: string) => void }) {
  const ROLES = ["admin", "doctor", "secretary", "patient"];
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
          <DropdownMenuItem
            key={r}
            className="capitalize"
            onSelect={() => onRoleChange(user.id, r)}
          >
            {r}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
          <PrefetchingLink href={`/control-panel/doctors/${user.id}`} className="flex items-center gap-2 cursor-pointer">
            <Eye className="h-4 w-4" />
            View
          </PrefetchingLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <PrefetchingLink href={`/control-panel/doctors/${user.id}?mode=edit`} className="flex items-center gap-2 cursor-pointer">
            <Pencil className="h-4 w-4" />
            Edit
          </PrefetchingLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DoctorManagement() {
  const { data, isLoading, updateUser } = useUsers({ role: "doctor", limit: 100 });
  const users = data?.users ?? [];

  const handleRoleChange = (id: string, role: string) => {
    updateUser({ id, role });
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "image",
      header: "",
      enableSorting: false,
      meta: { headClassName: "w-12", cellClassName: "w-12" },
      cell: ({ row }) => {
        const u = row.original;
        return (
          <UserAvatar
            src={u.image}
            fallbackText={u.display_name || u.email || "?"}
            sizeClassName="h-9 w-9"
          />
        );
      },
    },
    {
      id: "display_name",
      accessorFn: (row) => `${row.display_name ?? ""} ${row.email}`.trim(),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      meta: { headClassName: "min-w-[220px]", cellClassName: "min-w-[220px]" },
      cell: ({ row }) => {
        const u = row.original;
        const label = u.display_name ?? "—";
        const link =
          !u.id ? (
            <span className="font-medium text-foreground">{label}</span>
          ) : (
            <EntityTitleLink
              href={`/control-panel/doctors/${u.id}`}
              label={label}
              className="min-w-0 self-start truncate font-medium"
            />
          );
        return (
          <div className="flex min-w-0 max-w-[min(100%,320px)] flex-col gap-0.5">
            {link}
            <span className="truncate text-xs text-muted-foreground" title={u.email}>
              {u.email}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      meta: { headClassName: "min-w-[130px]", cellClassName: "min-w-[130px]" },
      cell: ({ row }) => (
        <RoleCell user={row.original} onRoleChange={handleRoleChange} />
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      meta: { headClassName: "min-w-[110px]", cellClassName: "min-w-[110px]" },
      cell: ({ row }) =>
        row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "—",
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      meta: { headClassName: "w-12 text-right", cellClassName: "w-12 text-right" },
      cell: ({ row }) => <ActionsCell user={row.original} />,
    },
  ];

  return (
    <div className="space-y-2 text-gray-700">
      <PageHeader
        title="Doctors"
        description="Accounts with role doctor. Staff admins use User / Admin Management."
      />
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
        emptyMessage="No doctors found."
        tableClassName="min-w-[860px]"
      />
    </div>
  );
}

