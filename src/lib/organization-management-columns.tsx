"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
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
  cpClinicalListMembersColumnShellClass,
} from "@/lib/cp-clinical-list-table-classes";
import {
  clinicalCellMutedTextClass,
  clinicalStackGapClass,
  clinicalTableCellWrapClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BuildColumnsArgs = {
  renderActions: (props: { org: Organization; isOwner: boolean }) => ReactNode;
};

/** Vertically centers cell content — multi-line stacks stay start-aligned. */
const cpOrgListCellClass = cn(
  "flex min-h-[2.75rem] flex-col justify-center",
  clinicalStackGapClass
);

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
          <div className={cn("min-w-0", cpOrgListCellClass)}>
            <EntityTitleLink
              href={href}
              label={org.name}
              className="font-normal text-sm"
            />
            <p className={clinicalCellMutedTextClass}>{org.slug}</p>
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
        <div className={cpOrgListCellClass}>
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
      meta: { shellClassName: cpClinicalListMembersColumnShellClass, colWidth: "16%" },
      cell: ({ row }) => (
        <div className={cn("min-w-0 max-w-full", cpOrgListCellClass)}>
          <OrganizationMembersRoleBadges membersByRole={row.original.members_by_role} />
        </div>
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
        <div className={cn(cpOrgListCellClass, "items-center")}>
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
          <div className={cpOrgListCellClass}>
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
        <div className={cpOrgListCellClass}>
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
