"use client";

import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { useLayoutEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  Hash,
  Link2,
  UserRound,
  Users,
} from "lucide-react";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { EntityDetailBackLink } from "@/components/shared/entity-detail/EntityDetailBackLink";
import { EntityDetailFooterRow } from "@/components/shared/entity-detail/EntityDetailFooterRow";
import { EntityDetailPageShell } from "@/components/shared/entity-detail/EntityDetailPageShell";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import { ClinicalDataTable } from "@/components/shared/ClinicalDataTable";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { Card, CardContent } from "@/components/ui/card";
import type { Organization } from "@/hooks/useOrganization";
import { seedOrganizationsListCacheFromSsr } from "@/lib/cp-list-query-ssr-seed";
import { buildOrganizationDetailMembersColumns } from "@/lib/organization-detail-members-columns";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";
import {
  organizationDetailBackButtonClass,
  organizationDetailCardBorderClass,
  organizationDetailCardFrameClass,
  organizationDetailChromeIconClass,
  organizationDetailChromeIconTileClass,
  organizationDetailDefinitionListClass,
  organizationDetailDefinitionRowClass,
  organizationDetailFieldIconCircleClass,
  organizationDetailFieldIconClass,
  organizationDetailSchemaSectionClass,
  organizationDetailSectionIconCircleClass,
  organizationDetailSectionIconClass,
  organizationDetailSnapshotTableFrameClass,
} from "@/lib/organization-detail-ui-classes";
import { entityDetailPageHeaderClass } from "@/lib/patient-detail-ui-classes";
import { cn } from "@/lib/utils";

export type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";

export type OrganizationDetailOrg = {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  owner_user_id: string;
  owner_label: string;
};

const LIST_BACK_HREF = "/control-panel/organization-management";

function DefinitionRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={organizationDetailDefinitionRowClass}>
      <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
        <span className={organizationDetailFieldIconCircleClass} aria-hidden>
          <Icon className={organizationDetailFieldIconClass} />
        </span>
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-gray-800">{children}</dd>
    </div>
  );
}

/** CP organization detail — indigo glass card + members ClinicalDataTable + footer back. */
export function OrganizationDetailScreen({
  org,
  members,
  initialOrganizations,
}: {
  org: OrganizationDetailOrg;
  members: OrganizationDetailMemberRow[];
  /** SSR org list — seeds queryKeys.organizations.all for instant back-to-list navigation. */
  initialOrganizations?: Organization[] | null;
}) {
  const queryClient = useQueryClient();
  const memberColumns = useMemo(() => buildOrganizationDetailMembersColumns(), []);

  useMemo(() => {
    seedOrganizationsListCacheFromSsr(queryClient, initialOrganizations ?? undefined);
    return null;
  }, [queryClient, initialOrganizations]);

  useLayoutEffect(() => {
    seedOrganizationsListCacheFromSsr(queryClient, initialOrganizations ?? undefined);
  }, [queryClient, initialOrganizations]);

  return (
    <EntityDetailPageShell
      shell="control-panel"
      header={
        <EntityDetailChromeHeader
          icon={Building2}
          iconTileClassName={organizationDetailChromeIconTileClass}
          iconClassName={organizationDetailChromeIconClass}
          className={entityDetailPageHeaderClass}
          title={org.name}
          description={`Organization Record — ${org.slug}`}
          actions={
            <EntityDetailBackLink
              href={LIST_BACK_HREF}
              placement="header"
              backButtonClassName={organizationDetailBackButtonClass}
            />
          }
        />
      }
    >
      <Card
        className={cn(
          "flex-1 bg-white/90 text-gray-700",
          organizationDetailCardBorderClass,
          organizationDetailCardFrameClass
        )}
      >
        <CardContent className="space-y-3 px-4 sm:px-6 text-gray-700">
          <div className="min-h-6">
            <h2 className="text-lg font-semibold text-gray-700">Organization Details</h2>
          </div>

          <div className={organizationDetailSchemaSectionClass}>
            <dl className={organizationDetailDefinitionListClass}>
              <DefinitionRow icon={Hash} label="Organization ID">
                <EntityIdCopyInline value={org.id} />
              </DefinitionRow>
              <DefinitionRow icon={Building2} label="Name">
                <span className="font-semibold">{org.name}</span>
              </DefinitionRow>
              <DefinitionRow icon={Link2} label="Slug">
                <span className="font-mono text-xs">{org.slug}</span>
              </DefinitionRow>
              <DefinitionRow icon={UserRound} label="Owner">
                <span>{org.owner_label}</span>
              </DefinitionRow>
              <DefinitionRow icon={CalendarDays} label="Created">
                {format(new Date(org.created_at), "PPpp")}
              </DefinitionRow>
            </dl>
          </div>

          <div className="border-t border-indigo-100/80 pt-3">
            <EntityDetailSnapshotSectionHeading
              icon={Users}
              sectionIconCircleClass={organizationDetailSectionIconCircleClass}
              iconClassName={organizationDetailSectionIconClass}
              count={members.length}
            >
              Members
            </EntityDetailSnapshotSectionHeading>
            <ClinicalDataTable
              columns={memberColumns}
              data={members}
              pagination={false}
              emptyMessage="No members yet."
              className={organizationDetailSnapshotTableFrameClass}
              tableFrameClassName="rounded-md border border-slate-200/80 bg-white shadow-none"
            />
          </div>
        </CardContent>
      </Card>

      <EntityDetailFooterRow
        backHref={LIST_BACK_HREF}
        backButtonClassName={organizationDetailBackButtonClass}
      />
    </EntityDetailPageShell>
  );
}
