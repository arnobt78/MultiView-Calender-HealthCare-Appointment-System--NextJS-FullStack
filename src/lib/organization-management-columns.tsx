"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Building2, MoreHorizontal, Users } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  clinicalCellPrimaryTextClass,
  entityDetailLinkClass,
} from "@/lib/table-display-styles";
import type { ReactNode } from "react";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  doctor: "bg-blue-100 text-blue-700",
  patient: "bg-green-100 text-green-700",
};

type BuildColumnsArgs = {
  renderActions: (props: { org: Organization; isOwner: boolean }) => ReactNode;
};

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
          <div className="flex min-w-0 items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
            <div className="min-w-0">
              <PrefetchingLink
                href={href}
                className={entityDetailLinkClass}
              >
                <span className={clinicalCellPrimaryTextClass}>{org.name}</span>
              </PrefetchingLink>
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
        <Badge className={ROLE_COLORS[row.original.role] ?? "bg-gray-100 text-gray-700"}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      id: "members",
      accessorFn: (row) => row.member_count,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Members" />
      ),
      meta: { shellClassName: "w-[14%] min-w-[8rem]" },
      cell: ({ row }) => {
        const m = row.original.members_by_role;
        return (
          <div className="space-y-0.5 text-xs">
            <p className="flex items-center gap-1 font-medium text-gray-800">
              <Users className="h-3 w-3 shrink-0" aria-hidden />
              {row.original.member_count}
            </p>
            <p className={clinicalCellMutedTextClass}>
              {m.admin} admin · {m.doctor} dr · {m.patient} pt
            </p>
          </div>
        );
      },
    },
    {
      id: "invoices",
      accessorFn: (row) => row.invoice_count,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoices" />
      ),
      meta: { shellClassName: "w-[8%] min-w-[5rem] text-center" },
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.invoice_count}</span>
      ),
    },
    {
      id: "outstanding",
      accessorFn: (row) => row.outstanding_cents,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Outstanding" />
      ),
      meta: { shellClassName: "w-[11%] min-w-[7rem]" },
      cell: ({ row }) => (
        <span className={clinicalCellPrimaryTextClass}>
          {formatInvoiceMoney({
            amount: row.original.outstanding_cents,
            currency: "eur",
            unit: "cents",
          })}
        </span>
      ),
    },
    {
      id: "created",
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      meta: { shellClassName: cpClinicalListJoinedColumnShellClass },
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {format(new Date(row.original.created_at), "dd MMM yyyy")}
        </span>
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

/** Ghost icon trigger for row actions menu. */
export function OrganizationActionsTrigger() {
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  );
}
