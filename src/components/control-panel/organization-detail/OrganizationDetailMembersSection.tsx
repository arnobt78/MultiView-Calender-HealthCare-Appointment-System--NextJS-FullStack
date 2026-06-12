"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ClinicalDataTable } from "@/components/shared/ClinicalDataTable";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { OrganizationDetailMembersSectionHeading } from "@/components/control-panel/organization-detail/OrganizationDetailMembersSectionHeading";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";
import {
  filterOrganizationDetailMembers,
  type OrganizationDetailMemberRoleFilter,
} from "@/lib/organization-detail-members-filter";
import {
  findFilterOptionLabel,
  orgMemberRoleFilterOptions,
} from "@/lib/filter-select-option-presets";
import type { OrganizationMembersByRole } from "@/lib/organization-list-enrich";

const ROLE_FILTER_OPTIONS = orgMemberRoleFilterOptions();

type OrganizationDetailMembersSectionProps = {
  orgName: string;
  members: OrganizationDetailMemberRow[];
  membersByRole: OrganizationMembersByRole;
  columns: ColumnDef<OrganizationDetailMemberRow>[];
  className?: string;
  tableFrameClassName?: string;
};

/**
 * Org detail members block — stacked header (billing parity) + filter toolbar + filtered table.
 * Header counts reflect full roster; table rows respect client-side search/role filters.
 */
export function OrganizationDetailMembersSection({
  orgName,
  members,
  membersByRole,
  columns,
  className,
  tableFrameClassName,
}: OrganizationDetailMembersSectionProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<OrganizationDetailMemberRoleFilter>("all");

  const filteredMembers = useMemo(
    () => filterOrganizationDetailMembers(members, { search, role: roleFilter }),
    [members, search, roleFilter]
  );

  const showReset = search.trim().length > 0 || roleFilter !== "all";
  const roleFilterLabel = findFilterOptionLabel(ROLE_FILTER_OPTIONS, roleFilter, "All Roles");

  const emptyMessage =
    members.length === 0 ? "No members yet." : "No members match your filters.";

  return (
    <>
      <OrganizationDetailMembersSectionHeading
        orgName={orgName}
        totalCount={members.length}
        membersByRole={membersByRole}
      />
      <ClinicalListFilterToolbar
        className="mb-3 mt-3"
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search members…",
          ariaLabel:
            "Search organization members by name, email, role, specialty, or member id",
        }}
        showReset={showReset}
        onReset={() => {
          setSearch("");
          setRoleFilter("all");
        }}
      >
        <FilterSelect
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as OrganizationDetailMemberRoleFilter)}
          displayLabel={roleFilterLabel}
          size="toolbar"
          triggerClassName="max-w-[200px]"
          ariaLabel="Filter members by role"
          options={ROLE_FILTER_OPTIONS}
        />
      </ClinicalListFilterToolbar>
      <ClinicalDataTable
        columns={columns}
        data={filteredMembers}
        pagination={false}
        emptyMessage={emptyMessage}
        className={className}
        tableFrameClassName={tableFrameClassName}
      />
    </>
  );
}
