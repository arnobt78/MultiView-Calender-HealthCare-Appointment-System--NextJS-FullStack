"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Mail } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { formatShortEntityId } from "@/lib/entity-id-display";
import {
  clinicalCellMutedTextClass,
  clinicalCellPrimaryTextClass,
  clinicalTableCellMinRowClass,
  clinicalTableColumnIdentityShellClass,
} from "@/lib/table-display-styles";

export type OrganizationDetailMemberRow = {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  display_name: string | null;
  email: string | null;
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  doctor: "bg-blue-100 text-blue-700",
  patient: "bg-green-100 text-green-700",
};

/** Org detail members snapshot — ClinicalDataTable parity with patient snapshot tables. */
export function buildOrganizationDetailMembersColumns(): ColumnDef<OrganizationDetailMemberRow>[] {
  return [
    {
      id: "member",
      accessorKey: "display_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Member" />,
      cell: ({ row }) => {
        const m = row.original;
        const label = m.display_name ?? m.email ?? "Unknown";
        return (
          <div className={clinicalTableColumnIdentityShellClass}>
            <div className={clinicalTableCellMinRowClass}>
              <UserAvatar
                alt={label}
                fallbackText={label}
                sizeClassName="h-7 w-7"
              />
              <div className="min-w-0">
                <p className={clinicalCellPrimaryTextClass}>{label}</p>
                {m.email ? (
                  <p className={`flex items-center gap-1 ${clinicalCellMutedTextClass}`}>
                    <Mail className="h-3 w-3 shrink-0" aria-hidden />
                    {m.email}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "role",
      accessorKey: "role",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => (
        <Badge className={ROLE_COLORS[row.original.role] ?? "bg-gray-100 text-gray-700"}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      id: "member_id",
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Member ID" />,
      cell: ({ row }) => (
        <EntityIdCopyInline
          value={row.original.id}
          displayValue={formatShortEntityId(row.original.id)}
          textClassName="text-xs text-muted-foreground font-mono"
        />
      ),
    },
    {
      id: "joined",
      accessorKey: "joined_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
      cell: ({ row }) => (
        <span className={clinicalCellMutedTextClass}>
          {format(new Date(row.original.joined_at), "PP")}
        </span>
      ),
    },
  ];
}
