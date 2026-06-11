"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { formatShortEntityId } from "@/lib/entity-id-display";
import { patientDetailHref, userDetailHref, type EntityRole } from "@/lib/entity-routes";
import {
  cpClinicalListActionsColumnShellClass,
  cpClinicalListIdentityColumnShellClass,
  cpClinicalListJoinedColumnShellClass,
} from "@/lib/cp-clinical-list-table-classes";
import {
  clinicalCellMutedTextClass,
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
  image?: string | null;
  platform_role?: string | null;
  specialty?: string | null;
  patient_id?: string | null;
  birth_date?: string | null;
  care_level?: number | null;
  patient_firstname?: string | null;
  patient_lastname?: string | null;
};

type BuildMembersColumnsArgs = {
  viewerRole: EntityRole;
  canManage?: boolean;
  renderActions?: (props: { member: OrganizationDetailMemberRow }) => ReactNode;
};

function memberDisplayName(m: OrganizationDetailMemberRow): string {
  if (m.role === "patient" && (m.patient_firstname || m.patient_lastname)) {
    return `${m.patient_firstname ?? ""} ${m.patient_lastname ?? ""}`.trim();
  }
  return m.display_name ?? m.email ?? "Unknown";
}

function OrganizationMemberIdentityCell({
  member,
  viewerRole,
}: {
  member: OrganizationDetailMemberRow;
  viewerRole: EntityRole;
}) {
  const label = memberDisplayName(member);

  if (member.role === "doctor") {
    return (
      <DoctorIdentityRow
        doctor={{
          id: member.user_id,
          email: member.email,
          display_name: member.display_name,
          image: member.image,
          specialty: member.specialty,
        }}
        linkKind="admin-cp"
        viewerRole={viewerRole}
        size="sm"
        showEmail
        showSpecialty
        className="min-h-[2.75rem]"
      />
    );
  }

  if (member.role === "patient" && member.patient_id) {
    return (
      <PatientIdentityCell
        name={label}
        email={member.email}
        href={patientDetailHref(viewerRole, member.patient_id)}
        linkPatient
        patient={{
          id: member.patient_id,
          email: member.email,
          birth_date: member.birth_date ?? null,
          firstname: member.patient_firstname ?? undefined,
          lastname: member.patient_lastname ?? undefined,
          clinical_profile: undefined,
        }}
        layout="inline"
        careLevel={member.care_level}
      />
    );
  }

  const href = userDetailHref(viewerRole, member.user_id);
  return (
    <div className={clinicalTableCellMinRowClass}>
      <UserAvatar
        alt={label}
        src={member.image}
        fallbackText={label}
        sizeClassName="h-9 w-9"
      />
      <div className="min-w-0">
        <EntityTitleLink href={href} label={label} className="min-w-0 truncate font-normal" />
        {member.email ? (
          <p className={clinicalCellMutedTextClass}>{member.email}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Org detail members — CP list identity parity + optional ⋮ actions. */
export function buildOrganizationDetailMembersColumns(
  args: BuildMembersColumnsArgs
): ColumnDef<OrganizationDetailMemberRow>[] {
  const { viewerRole, canManage, renderActions } = args;
  const cols: ColumnDef<OrganizationDetailMemberRow>[] = [
    {
      id: "member",
      accessorKey: "display_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Member" />,
      meta: { shellClassName: cpClinicalListIdentityColumnShellClass },
      cell: ({ row }) => (
        <div className={clinicalTableColumnIdentityShellClass}>
          <OrganizationMemberIdentityCell
            member={row.original}
            viewerRole={viewerRole}
          />
        </div>
      ),
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
      meta: { shellClassName: cpClinicalListJoinedColumnShellClass },
      cell: ({ row }) => (
        <span className={clinicalCellMutedTextClass}>
          {format(new Date(row.original.joined_at), "PP")}
        </span>
      ),
    },
  ];

  if (canManage && renderActions) {
    cols.push({
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" className="text-right" />
      ),
      enableSorting: false,
      meta: { shellClassName: cpClinicalListActionsColumnShellClass },
      cell: ({ row }) => (
        <div className="flex min-h-[2.75rem] items-center justify-end">
          {renderActions({ member: row.original })}
        </div>
      ),
    });
  }

  return cols;
}
