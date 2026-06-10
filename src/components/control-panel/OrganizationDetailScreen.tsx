"use client";

import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarDays,
  Hash,
  Link2,
  Mail,
  UserRound,
  Users,
} from "lucide-react";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { EntityDetailBackLink } from "@/components/shared/entity-detail/EntityDetailBackLink";
import { EntityDetailFooterRow } from "@/components/shared/entity-detail/EntityDetailFooterRow";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatShortEntityId } from "@/lib/entity-id-display";
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
} from "@/lib/organization-detail-ui-classes";
import { entityDetailPageHeaderClass } from "@/lib/patient-detail-ui-classes";
import { resolveEntityDetailRootClass } from "@/lib/section-page-layout";
import { cn } from "@/lib/utils";

export type OrganizationDetailMemberRow = {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  display_name: string | null;
  email: string | null;
};

export type OrganizationDetailOrg = {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  owner_user_id: string;
  owner_label: string;
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  doctor: "bg-blue-100 text-blue-700",
  patient: "bg-green-100 text-green-700",
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

/** CP organization detail — indigo glass card + members table + footer back (C14 parity). */
export function OrganizationDetailScreen({
  org,
  members,
}: {
  org: OrganizationDetailOrg;
  members: OrganizationDetailMemberRow[];
}) {
  return (
    <div className={resolveEntityDetailRootClass("control-panel")}>
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
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => {
                    const label = m.display_name ?? m.email ?? "Unknown";
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              alt={label}
                              fallbackText={label}
                              sizeClassName="h-7 w-7"
                            />
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              {m.email ? (
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" aria-hidden />
                                  {m.email}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={ROLE_COLORS[m.role] ?? "bg-gray-100 text-gray-700"}>
                            {m.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <EntityIdCopyInline
                            value={m.id}
                            displayValue={formatShortEntityId(m.id)}
                            textClassName="text-xs text-muted-foreground font-mono"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(m.joined_at), "PP")}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <EntityDetailFooterRow
        backHref={LIST_BACK_HREF}
        backButtonClassName={organizationDetailBackButtonClass}
      />
    </div>
  );
}
