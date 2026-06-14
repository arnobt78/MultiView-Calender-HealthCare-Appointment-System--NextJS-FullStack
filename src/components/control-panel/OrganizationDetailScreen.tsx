"use client";

import type { LucideIcon } from "lucide-react";
import { useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
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
import { EntityDetailRecordAuditCard } from "@/components/shared/entity-detail/EntityDetailRecordAuditCard";
import { EntityDetailAuditActorInline } from "@/components/shared/entity-detail/EntityDetailAuditActorInline";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { OrganizationBillingPanelFull } from "@/components/control-panel/OrganizationBillingPanel";
import { OrganizationFormDialog } from "@/components/control-panel/organization-dialog/OrganizationFormDialog";
import { OrganizationAddMemberDialog } from "@/components/control-panel/organization-dialog/OrganizationAddMemberDialog";
import { OrganizationDetailMembersSection } from "@/components/control-panel/organization-detail/OrganizationDetailMembersSection";
import { OrganizationMemberRowActions } from "@/components/control-panel/organization-detail/OrganizationMemberRowActions";
import { Card, CardContent } from "@/components/ui/card";
import type { Organization } from "@/hooks/useOrganization";
import { useOrganization, useOrganizationDetail } from "@/hooks/useOrganization";
import {
  seedOrganizationsListCacheFromSsr,
  seedOrgBillingCacheFromSsr,
  seedOrganizationDetailCacheFromSsr,
} from "@/lib/cp-list-query-ssr-seed";
import { cpClinicalListTableFrameClassName } from "@/lib/cp-clinical-list-table-classes";
import { buildOrganizationDetailMembersColumns } from "@/lib/organization-detail-members-columns";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";
import type { OrganizationDetailOrg } from "@/lib/organization-detail-load";
import { countOrganizationMembersByRole, formatOrganizationTypeLabel } from "@/lib/organization-detail-display";
import { mapOrganizationRecordAuditActors } from "@/lib/entity-detail-audit-actor";
import type { EntityRole } from "@/lib/entity-routes";
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
  organizationDetailSnapshotTableFrameClass,
} from "@/lib/organization-detail-ui-classes";
import { entityDetailPageHeaderClass } from "@/lib/patient-detail-ui-classes";
import {
  buildOrganizationDeleteConfirmSubtitle,
  DELETE_ORGANIZATION_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import { clinicalEmptyOr } from "@/components/shared/ClinicalTableEmptyDash";
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
      <dd className="min-w-0 text-sm text-gray-700">{children}</dd>
    </div>
  );
}

/** CP organization detail — indigo glass + members + full billing + CRUD (REQ-0065). */
export function OrganizationDetailScreen({
  org: initialOrg,
  members: initialMembers,
  initialOrganizations,
  initialOrgBilling,
  viewerRole = "admin",
}: {
  org: OrganizationDetailOrg;
  members: OrganizationDetailMemberRow[];
  initialOrganizations?: Organization[] | null;
  initialOrgBilling?: OrgBillingCachePayload | null;
  viewerRole?: EntityRole;
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

  const { org, members } = useOrganizationDetail(initialOrg.id, {
    initialOrg,
    initialMembers,
  });

  const liveOrg = org ?? initialOrg;

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: initialOrg.name });

  const isOwner = liveOrg.viewer_role === "admin";
  const recordAuditActors = useMemo(
    () => mapOrganizationRecordAuditActors(liveOrg),
    [liveOrg]
  );
  const membersByRole = useMemo(
    () => countOrganizationMembersByRole(members),
    [members]
  );
  const typeLabel = formatOrganizationTypeLabel(liveOrg.org_type);

  /** Seed TanStack before hooks subscribe — same pattern as PatientDetailScreen. */
  useLayoutEffect(() => {
    seedOrganizationsListCacheFromSsr(queryClient, initialOrganizations ?? undefined);
    seedOrganizationDetailCacheFromSsr(queryClient, initialOrg.id, {
      org: initialOrg,
      members: initialMembers,
    });
    if (initialOrgBilling) {
      seedOrgBillingCacheFromSsr(queryClient, {
        [initialOrg.id]: initialOrgBilling,
      });
    }
  }, [queryClient, initialOrganizations, initialOrgBilling, initialOrg, initialMembers]);

  const memberColumns = useMemo(
    () =>
      buildOrganizationDetailMembersColumns({
        viewerRole,
        canManage: isOwner,
        renderActions: isOwner
          ? ({ member }) => (
            <OrganizationMemberRowActions
              member={member}
              orgName={liveOrg.name}
              viewerRole={viewerRole}
              canManage={isOwner}
              onRemoveMember={(m) =>
                removeMember({
                  orgId: liveOrg.id,
                  userId: m.user_id,
                  memberLabel: m.display_name ?? m.email ?? "Member",
                })
              }
            />
          )
          : undefined,
      }),
    [isOwner, viewerRole, liveOrg.id, liveOrg.name, removeMember]
  );

  const handleSaveEdit = () => {
    const name = editForm.name.trim();
    if (!name) return;
    updateOrg(
      { orgId: liveOrg.id, name },
      {
        onSuccess: () => {
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
              <EntityDetailRecordAuditCard
                createdAt={liveOrg.created_at}
                updatedAt={liveOrg.updated_at}
                createdBy={recordAuditActors.createdBy}
                updatedBy={recordAuditActors.updatedBy}
                viewerRole={viewerRole}
                iconCircleClass={organizationDetailFieldIconCircleClass}
                iconClassName="h-3 w-3 text-indigo-600"
              />
              <DefinitionRow icon={Hash} label="Organization ID">
                <EntityIdCopyInline value={liveOrg.id} />
              </DefinitionRow>
              <DefinitionRow icon={Building2} label="Name">
                <span className="font-semibold">{liveOrg.name}</span>
              </DefinitionRow>
              <DefinitionRow icon={Link2} label="Slug">
                <span className="font-mono text-xs">{liveOrg.slug}</span>
              </DefinitionRow>
              <DefinitionRow icon={UserRound} label="Owner">
                {liveOrg.owner ? (
                  <EntityDetailAuditActorInline
                    actor={liveOrg.owner}
                    viewerRole={viewerRole}
                  />
                ) : (
                  <span>{liveOrg.owner_label}</span>
                )}
              </DefinitionRow>
              {typeLabel ? (
                <DefinitionRow icon={Building2} label="Type">
                  {clinicalEmptyOr(typeLabel, "definition")}
                </DefinitionRow>
              ) : null}
              {liveOrg.description ? (
                <DefinitionRow icon={Building2} label="Description">
                  {liveOrg.description}
                </DefinitionRow>
              ) : null}
              {liveOrg.website ? (
                <DefinitionRow icon={Globe} label="Website">
                  <a
                    href={liveOrg.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 hover:text-indigo-900"
                  >
                    {liveOrg.website}
                  </a>
                </DefinitionRow>
              ) : null}
              {liveOrg.phone ? (
                <DefinitionRow icon={Phone} label="Phone">
                  {liveOrg.phone}
                </DefinitionRow>
              ) : null}
              {liveOrg.address ? (
                <DefinitionRow icon={MapPin} label="Address">
                  {liveOrg.address}
                </DefinitionRow>
              ) : null}
              {liveOrg.timezone ? (
                <DefinitionRow icon={Clock} label="Timezone">
                  {liveOrg.timezone}
                </DefinitionRow>
              ) : null}
            </dl>
          </div>

          <div className="border-t border-indigo-100/80 pt-3">
            <OrganizationDetailMembersSection
              orgName={liveOrg.name}
              members={members}
              membersByRole={membersByRole}
              columns={memberColumns}
              className={organizationDetailSnapshotTableFrameClass}
              tableFrameClassName={cpClinicalListTableFrameClassName}
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
              members_by_role: membersByRole,
              invoice_count: 0,
              outstanding_cents: 0,
            }}
            open={addMemberOpen}
            onOpenChange={setAddMemberOpen}
            existingMemberUserIds={members.map((m) => m.user_id)}
            onAdd={(args) =>
              addMember(args, {
                onSuccess: () => {
                  setAddMemberOpen(false);
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
        </>
      ) : null}
    </EntityDetailPageShell>
  );
}
