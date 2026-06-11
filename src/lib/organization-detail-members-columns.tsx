"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Mail, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { Button } from "@/components/ui/button";
import { formatShortEntityId } from "@/lib/entity-id-display";
import {
  clinicalCellMutedTextClass,
  clinicalCellPrimaryTextClass,
  clinicalTableCellMinRowClass,
  clinicalTableColumnIdentityShellClass,
} from "@/lib/table-display-styles";
import { cpClinicalListActionsColumnShellClass } from "@/lib/cp-clinical-list-table-classes";

export type OrganizationDetailMemberRow = {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  display_name: string | null;
  email: string | null;
};

type BuildMembersColumnsArgs = {
  canManage?: boolean;
  onRemoveMember?: (member: OrganizationDetailMemberRow) => void;
};

/** Org detail members snapshot — optional remove action for org admins. */
export function buildOrganizationDetailMembersColumns(
  args: BuildMembersColumnsArgs = {}
): ColumnDef<OrganizationDetailMemberRow>[] {
  const { canManage, onRemoveMember } = args;
  const cols: ColumnDef<OrganizationDetailMemberRow>[] = [
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
        <div className={clinicalTableCellMinRowClass}>
          <UserRoleBadge role={row.original.role} />
        </div>
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

  if (canManage && onRemoveMember) {
    cols.push({
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" className="text-right" />
      ),
      enableSorting: false,
      meta: { shellClassName: cpClinicalListActionsColumnShellClass },
      cell: ({ row }) => (
        <div className="flex min-h-[2.75rem] items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700"
            aria-label="Remove member"
            onClick={() => onRemoveMember(row.original)}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ),
    });
  }

  return cols;
}
