"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Building2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { OrganizationMembersRoleBadges } from "@/components/shared/OrganizationMembersRoleBadges";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import type { Organization } from "@/hooks/useOrganization";
import { organizationDetailHref } from "@/lib/entity-routes";
import { formatInvoiceMoney } from "@/lib/crud-notify-messages";
import {
  cpClinicalListActionsColumnShellClass,
  cpClinicalListIdentityColumnShellClass,
  cpClinicalListJoinedColumnShellClass,
} from "@/lib/cp-clinical-list-table-classes";
import {
  clinicalCellMutedTextClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BuildColumnsArgs = {
  renderActions: (props: { org: Organization; isOwner: boolean }) => ReactNode;
};

function outstandingAmountClass(cents: number): string {
  if (cents > 0) return "text-xs font-semibold tabular-nums text-amber-700";
  return clinicalCellMutedTextClass;
}

/** CP organization list — DataTable columns (patient-management parity). */
export function buildOrganizationManagementColumns({
  renderActions,
}: BuildColumnsArgs): ColumnDef<Organization>[] {
  return [
    {
      id: "organization",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Organization" />
      ),
      meta: { shellClassName: cpClinicalListIdentityColumnShellClass },
      cell: ({ row }) => {
        const org = row.original;
        const href = organizationDetailHref("admin", org.id);
        return (
          <div className={cn("flex min-w-0 items-center gap-2", clinicalTableCellMinRowClass)}>
            <Building2 className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
            <div className="min-w-0 space-y-0.5">
              <EntityTitleLink
                href={href}
                label={org.name}
                className="font-normal text-sm"
              />
              <p className={clinicalCellMutedTextClass}>{org.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "your_role",
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Your Role" />
      ),
      meta: { shellClassName: "w-[10%] min-w-[6rem]" },
      cell: ({ row }) => (
        <div className={cn("flex items-center", clinicalTableCellMinRowClass)}>
          <UserRoleBadge role={row.original.role} />
        </div>
      ),
    },
    {
      id: "members",
      accessorFn: (row) => row.member_count,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Members" />
      ),
      meta: { shellClassName: "w-[16%] min-w-[10rem]" },
      cell: ({ row }) => (
        <OrganizationMembersRoleBadges membersByRole={row.original.members_by_role} />
      ),
    },
    {
      id: "invoices",
      accessorFn: (row) => row.invoice_count,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoices" />
      ),
      meta: { shellClassName: "w-[8%] min-w-[5rem] text-center" },
      cell: ({ row }) => (
        <div className={cn("flex items-center justify-center", clinicalTableCellMinRowClass)}>
          <span className={clinicalCellMutedTextClass}>{row.original.invoice_count}</span>
        </div>
      ),
    },
    {
      id: "outstanding",
      accessorFn: (row) => row.outstanding_cents,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Outstanding" />
      ),
      meta: { shellClassName: "w-[11%] min-w-[7rem]" },
      cell: ({ row }) => {
        const cents = row.original.outstanding_cents;
        return (
          <div className={cn("flex items-center", clinicalTableCellMinRowClass)}>
            <span className={outstandingAmountClass(cents)}>
              {formatInvoiceMoney({
                amount: cents,
                currency: "eur",
                unit: "cents",
              })}
            </span>
          </div>
        );
      },
    },
    {
      id: "created",
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      meta: { shellClassName: cpClinicalListJoinedColumnShellClass },
      cell: ({ row }) => (
        <div className={cn("flex items-center", clinicalTableCellMinRowClass)}>
          <span className={cn("whitespace-nowrap", clinicalCellMutedTextClass)}>
            {format(new Date(row.original.created_at), "MMM d, yyyy")}
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
      cell: ({ row }) => {
        const org = row.original;
        const isOwner = org.role === "admin";
        return (
          <div className="flex min-h-[2.75rem] items-center justify-end">
            {renderActions({ org, isOwner })}
          </div>
        );
      },
    },
  ];
}
