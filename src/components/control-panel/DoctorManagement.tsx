"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useUsers } from "@/hooks/useUsers";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types/types";
import { Pencil } from "lucide-react";

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "image",
    header: "",
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
    cell: ({ row }) => row.original.role ?? "—",
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
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/control-panel/doctors/${id}`} aria-label="View user">
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];

export default function DoctorManagement() {
  const { data, isLoading } = useUsers({ limit: 100 });
  const users = data?.users ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Doctor / User Management"
        description="View users (doctors and staff). All table schema properties are shown."
      />
      <DataTable<User, unknown>
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchColumnId="email"
        searchPlaceholder="Search by email..."
        emptyMessage="No users found."
      />
    </div>
  );
}
