"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useUsers } from "@/hooks/useUsers";
import { DataTable } from "@/components/shared/DataTable";
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
import { EllipsisVertical, Pencil, ShieldCheck } from "lucide-react";

/** Staff accounts (admin + secretary); doctors and portal patients use other control-panel tabs. */
const STAFF_ROLES = ["admin", "secretary"] as const;

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
          <Link href={`/control-panel/doctors/${user.id}`} className="flex items-center gap-2 cursor-pointer">
            <Pencil className="h-4 w-4" />
            View / Edit
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UserManagement() {
  const { data, isLoading, updateUser } = useUsers({
    roles: [...STAFF_ROLES],
    limit: 100,
  });
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
      accessorKey: "display_name",
      header: "Name",
      meta: { headClassName: "min-w-[180px]", cellClassName: "min-w-[180px]" },
      cell: ({ row }) => {
        const label = row.original.display_name ?? "—";
        if (!row.original.id) return label;
        return <EntityTitleLink href={`/control-panel/doctors/${row.original.id}`} label={label} />;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: { headClassName: "min-w-[190px]", cellClassName: "min-w-[190px]" },
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "role",
      header: "Role",
      meta: { headClassName: "min-w-[130px]", cellClassName: "min-w-[130px]" },
      cell: ({ row }) => <RoleCell user={row.original} onRoleChange={handleRoleChange} />,
    },
    {
      accessorKey: "created_at",
      header: "Created",
      meta: { headClassName: "min-w-[110px]", cellClassName: "min-w-[110px]" },
      cell: ({ row }) =>
        row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—",
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
        title="User / Admin Management"
        description="Staff accounts (admin, secretary). Doctors and patients have dedicated tabs."
      />
      <DataTable<User, unknown>
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchColumnId="email"
        searchPlaceholder="Search by email…"
        emptyMessage="No staff users found."
      />
    </div>
  );
}
