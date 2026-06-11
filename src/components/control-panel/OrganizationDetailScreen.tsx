"use client";

import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  Globe,
  Hash,
  Link2,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserRound,
  Users,
  Clock,
} from "lucide-react";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { EntityDetailBackLink } from "@/components/shared/entity-detail/EntityDetailBackLink";
import { EntityDetailFooterRow } from "@/components/shared/entity-detail/EntityDetailFooterRow";
import { EntityDetailPageShell } from "@/components/shared/entity-detail/EntityDetailPageShell";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import { ClinicalDataTable } from "@/components/shared/ClinicalDataTable";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { OrganizationBillingPanelFull } from "@/components/control-panel/OrganizationBillingPanel";
import { OrganizationFormDialog } from "@/components/control-panel/organization-dialog/OrganizationFormDialog";
import { OrganizationAddMemberDialog } from "@/components/control-panel/organization-dialog/OrganizationAddMemberDialog";
import { Card, CardContent } from "@/components/ui/card";
import type { Organization } from "@/hooks/useOrganization";
import { useOrganization } from "@/hooks/useOrganization";
import {
  seedOrganizationsListCacheFromSsr,
  seedOrgBillingCacheFromSsr,
  seedOrganizationDetailCacheFromSsr,
} from "@/lib/cp-list-query-ssr-seed";
import { buildOrganizationDetailMembersColumns } from "@/lib/organization-detail-members-columns";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";
import type { OrganizationDetailOrg } from "@/lib/organization-detail-load";
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
import {
  buildOrganizationDeleteConfirmSubtitle,
  DELETE_ORGANIZATION_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import { ClinicalEmptyDash, clinicalEmptyOr } from "@/components/shared/ClinicalTableEmptyDash";
import type { OrgBillingCachePayload } from "@/lib/org-billing-prefetch";
import { cn, toTitleCaseLabel } from "@/lib/utils";

export type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";
export type { OrganizationDetailOrg } from "@/lib/organization-detail-load";

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

/** CP organization detail — indigo glass + members + full billing + CRUD (REQ-0065). */
export function OrganizationDetailScreen({
  org,
  members: initialMembers,
  initialOrganizations,
  initialOrgBilling,
}: {
  org: OrganizationDetailOrg;
  members: OrganizationDetailMemberRow[];
  initialOrganizations?: Organization[] | null;
  initialOrgBilling?: OrgBillingCachePayload | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    addMember,
    isAddingMember,
    removeMember,
    deleteOrg,
    updateOrg,
    isUpdating,
  } = useOrganization();

  const [members, setMembers] = useState(initialMembers);
  const [liveOrg, setLiveOrg] = useState(org);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [removeMemberTarget, setRemoveMemberTarget] =
    useState<OrganizationDetailMemberRow | null>(null);
  const [editForm, setEditForm] = useState({ name: org.name });

  const isOwner = liveOrg.viewer_role === "admin";

  useMemo(() => {
    seedOrganizationsListCacheFromSsr(queryClient, initialOrganizations ?? undefined);
    seedOrganizationDetailCacheFromSsr(queryClient, liveOrg.id, { org: liveOrg, members: initialMembers });
    if (initialOrgBilling) {
      seedOrgBillingCacheFromSsr(queryClient, {
        [liveOrg.id]: initialOrgBilling,
      });
    }
    return null;
  }, [queryClient, initialOrganizations, initialOrgBilling, liveOrg, initialMembers]);

  useLayoutEffect(() => {
    seedOrganizationsListCacheFromSsr(queryClient, initialOrganizations ?? undefined);
    seedOrganizationDetailCacheFromSsr(queryClient, liveOrg.id, { org: liveOrg, members: initialMembers });
    if (initialOrgBilling) {
      seedOrgBillingCacheFromSsr(queryClient, {
        [liveOrg.id]: initialOrgBilling,
      });
    }
  }, [queryClient, initialOrganizations, initialOrgBilling, liveOrg, initialMembers]);

  const memberColumns = useMemo(
    () =>
      buildOrganizationDetailMembersColumns({
        canManage: isOwner,
        onRemoveMember: isOwner ? setRemoveMemberTarget : undefined,
      }),
    [isOwner]
  );

  const handleSaveEdit = () => {
    const name = editForm.name.trim();
    if (!name) return;
    updateOrg(
      { orgId: liveOrg.id, name },
      {
        onSuccess: () => {
          setLiveOrg((prev) => ({ ...prev, name }));
          setEditDialogOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteOrg(liveOrg.id, {
      onSuccess: () => {
        router.push(LIST_BACK_HREF);
      },
    });
  };

  const handleRemoveMember = () => {
    if (!removeMemberTarget) return;
    const member = removeMemberTarget;
    removeMember(
      {
        orgId: liveOrg.id,
        userId: member.user_id,
        memberLabel: member.display_name ?? member.email ?? "Member",
      },
      {
        onSuccess: () => {
          setMembers((prev) => prev.filter((m) => m.id !== member.id));
          setRemoveMemberTarget(null);
        },
      }
    );
  };

  return (
    <EntityDetailPageShell
      shell="control-panel"
      header={
        <EntityDetailChromeHeader
          icon={Building2}
          iconTileClassName={organizationDetailChromeIconTileClass}
          iconClassName={organizationDetailChromeIconClass}
          className={entityDetailPageHeaderClass}
          title={liveOrg.name}
          description={`Organization Record — ${liveOrg.slug}`}
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
                <span className="font-semibold">{liveOrg.name}</span>
              </DefinitionRow>
              <DefinitionRow icon={Link2} label="Slug">
                <span className="font-mono text-xs">{org.slug}</span>
              </DefinitionRow>
              <DefinitionRow icon={UserRound} label="Owner">
                <span>{org.owner_label}</span>
              </DefinitionRow>
              {org.org_type ? (
                <DefinitionRow icon={Building2} label="Type">
                  {clinicalEmptyOr(org.org_type, "definition")}
                </DefinitionRow>
              ) : null}
              {org.description ? (
                <DefinitionRow icon={Building2} label="Description">
                  {org.description}
                </DefinitionRow>
              ) : null}
              {org.website ? (
                <DefinitionRow icon={Globe} label="Website">
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 hover:underline"
                  >
                    {org.website}
                  </a>
                </DefinitionRow>
              ) : null}
              {org.phone ? (
                <DefinitionRow icon={Phone} label="Phone">
                  {org.phone}
                </DefinitionRow>
              ) : null}
              {org.address ? (
                <DefinitionRow icon={MapPin} label="Address">
                  {org.address}
                </DefinitionRow>
              ) : null}
              {org.timezone ? (
                <DefinitionRow icon={Clock} label="Timezone">
                  {org.timezone}
                </DefinitionRow>
              ) : null}
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

      <OrganizationBillingPanelFull
        organizationId={liveOrg.id}
        organizationName={liveOrg.name}
      />

      <EntityDetailFooterRow
        backHref={LIST_BACK_HREF}
        backButtonClassName={organizationDetailBackButtonClass}
        actions={
          isOwner ? (
            <>
              <ControlPanelGlassActionButton
                type="button"
                variant="emerald"
                onClick={() => {
                  setEditForm({ name: liveOrg.name });
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="shrink-0" aria-hidden />
                {toTitleCaseLabel("Edit Organization")}
              </ControlPanelGlassActionButton>
              <ControlPanelGlassActionButton
                type="button"
                variant="emerald"
                onClick={() => setAddMemberOpen(true)}
              >
                <Users className="shrink-0" aria-hidden />
                {toTitleCaseLabel("Add Member")}
              </ControlPanelGlassActionButton>
              <ControlPanelGlassActionButton
                type="button"
                variant="rose"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="shrink-0" aria-hidden />
                {toTitleCaseLabel("Delete Organization")}
              </ControlPanelGlassActionButton>
            </>
          ) : undefined
        }
      />

      {isOwner ? (
        <>
          <OrganizationFormDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            mode="edit"
            form={editForm}
            onFormChange={(patch) => setEditForm((p) => ({ ...p, ...patch }))}
            onSubmit={handleSaveEdit}
            isSubmitting={isUpdating}
          />
          <OrganizationAddMemberDialog
            org={{
              id: liveOrg.id,
              name: liveOrg.name,
              slug: liveOrg.slug,
              owner_user_id: liveOrg.owner_user_id,
              role: liveOrg.viewer_role ?? "admin",
              created_at: liveOrg.created_at,
              member_count: members.length,
              members_by_role: { admin: 0, doctor: 0, patient: 0 },
              invoice_count: 0,
              outstanding_cents: 0,
            }}
            open={addMemberOpen}
            onOpenChange={setAddMemberOpen}
            onAdd={(args) =>
              addMember(args, {
                onSuccess: (_data, variables) => {
                  setAddMemberOpen(false);
                  setMembers((prev) => [
                    ...prev,
                    {
                      id: `pending-${variables.userId}`,
                      org_id: liveOrg.id,
                      user_id: variables.userId,
                      role: variables.role,
                      joined_at: new Date().toISOString(),
                      display_name: variables.memberLabel ?? null,
                      email: null,
                    },
                  ]);
                },
              })
            }
            isSubmitting={isAddingMember}
          />
          <ConfirmActionDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            variant="destructive"
            title={DELETE_ORGANIZATION_CONFIRM_TITLE}
            subtitle={buildOrganizationDeleteConfirmSubtitle(liveOrg.name)}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={handleDelete}
          />
          <ConfirmActionDialog
            open={!!removeMemberTarget}
            onOpenChange={(open) => {
              if (!open) setRemoveMemberTarget(null);
            }}
            variant="destructive"
            title="Remove Member"
            subtitle={`Remove ${removeMemberTarget?.display_name ?? removeMemberTarget?.email ?? "this member"} from ${liveOrg.name}?`}
            confirmLabel="Remove"
            cancelLabel="Cancel"
            onConfirm={handleRemoveMember}
          />
        </>
      ) : null}
    </EntityDetailPageShell>
  );
}
