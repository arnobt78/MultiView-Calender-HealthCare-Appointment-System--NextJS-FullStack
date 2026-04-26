"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useUsers } from "@/hooks/useUsers";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types/types";
import { MoreHorizontal, Pencil, ShieldCheck } from "lucide-react";

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  doctor: "secondary",
  secretary: "outline",
  patient: "outline",
};

function RoleCell({ user, onRoleChange }: { user: User; onRoleChange: (id: string, role: string) => void }) {
  const ROLES = ["admin", "doctor", "secretary", "patient"];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1">
          <Badge variant={ROLE_VARIANTS[user.role ?? ""] ?? "outline"} className="capitalize text-xs">
            {user.role ?? "—"}
          </Badge>
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
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
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

export default function DoctorManagement() {
  const { data, isLoading, updateUser } = useUsers({ limit: 100 });
  const users = data?.users ?? [];

  const handleRoleChange = (id: string, role: string) => {
    updateUser({ id, role });
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "image",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={u.image ?? undefined} alt="" />
            <AvatarFallback>
              {(u.display_name || u.email || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "display_name",
      header: "Name",
      cell: ({ row }) => row.original.display_name ?? "—",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <RoleCell user={row.original} onRoleChange={handleRoleChange} />
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) =>
        row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "—",
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => <ActionsCell user={row.original} />,
    },
  ];

  return (
    <div className="space-y-2">
      <PageHeader
        title="Doctor / User Management"
        description="Manage users and their roles. Click a role badge to change it inline."
      />
      <DataTable<User, unknown>
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchColumnId="email"
        searchPlaceholder="Search by email…"
        emptyMessage="No users found."
      />
    </div>
  );
}

