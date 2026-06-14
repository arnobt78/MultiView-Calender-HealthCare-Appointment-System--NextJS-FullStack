"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { clinicalEmptyOr } from "@/components/shared/ClinicalTableEmptyDash";
import {
  Calendar,
  CalendarDays,
  Clock,
  Hash,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  User as UserIcon,
  UserCog,
} from "lucide-react";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { EntityDetailBackLink } from "@/components/shared/entity-detail/EntityDetailBackLink";
import { EntityDetailFooterRow } from "@/components/shared/entity-detail/EntityDetailFooterRow";
import { violetGlassBackButtonClass } from "@/lib/calendar-header-action-styles";
import { ControlPanelHeaderSubtitle } from "@/components/control-panel/ControlPanelHeaderSubtitle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { EntityActiveStatusBadge } from "@/components/shared/entity-display/EntityActiveStatusBadge";
import { EntityEmailVerificationBadge } from "@/components/shared/entity-display/EntityEmailVerificationBadge";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { AdminUserFormDialog } from "@/components/control-panel/admin-user-dialog/AdminUserFormDialog";
import { ClinicalDataTable } from "@/components/shared/ClinicalDataTable";
import { buildRelatedAppointmentsColumns } from "@/components/control-panel/patient-detail-snapshot-columns";
import {
  adminUserDetailCardFrameClass,
  adminUserDetailFieldIconCircleClass,
  adminUserDetailFieldIconClass,
  adminUserDetailAuditIconCircleClass,
  adminUserDetailSnapshotSectionShellClass,
  adminUserDetailSnapshotTableFrameClass,
  adminUserDetailSectionIconClass,
} from "@/lib/admin-user-detail-ui-classes";
import {
  entityDetailChromeVioletIconClass,
  entityDetailChromeVioletIconTileClass,
} from "@/lib/page-chrome-classes";
import {
  entityDetailPageHeaderClass,
  patientDetailDefinitionListClass,
  patientDetailDefinitionRowClass,
  patientDetailSchemaSectionClass,
} from "@/lib/patient-detail-ui-classes";
import { EntityDetailPageShell } from "@/components/shared/entity-detail/EntityDetailPageShell";
import type { AppSectionScrollShell } from "@/lib/section-page-layout";
import type { AppointmentSnapshotRow, User } from "@/types/types";
import { useUser } from "@/hooks/useUsers";
import { queryKeys } from "@/lib/query-keys";
import {
  adminUserFormToUpdatePayload,
  EMPTY_ADMIN_USER_FORM,
  userToAdminUserForm,
  type AdminUserFormValues,
} from "@/lib/admin-user-form-state";
import { cn } from "@/lib/utils";
import { EntityDetailRecordAuditCard } from "@/components/shared/entity-detail/EntityDetailRecordAuditCard";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { mapUserRecordAuditActors } from "@/lib/entity-detail-audit-actor";
import type { EntityRole } from "@/lib/entity-routes";
import { clinicalSnapshotAppointmentsTableMinWidthClass } from "@/lib/clinical-snapshot-table-columns";
import { isUserAccountActive } from "@/lib/entity-active-status";
import { buildStaffDirectoryMap } from "@/lib/staff-directory-cache";
import { useUsers } from "@/hooks/useUsers";
import { CP_DOCTOR_USERS_FILTERS } from "@/lib/control-panel-users-filters";

type AdminUserDetailScreenProps = {
  userId: string;
  canAdminEdit: boolean;
  listBackHref: string;
  scrollShell?: AppSectionScrollShell;
  initialUser: User;
  appointmentCount: number;
  emailVerified: boolean;
  initialAppointments: AppointmentSnapshotRow[];
};

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: typeof UserIcon;
  children: React.ReactNode;
}) {
  return (
    <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
      <span className={adminUserDetailFieldIconCircleClass}>
        <Icon className={adminUserDetailFieldIconClass} aria-hidden />
      </span>
      {children}
    </dt>
  );
}

function SectionHeading({
  icon: Icon,
  count,
  children,
}: {
  icon: typeof Calendar;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={adminUserDetailSectionIconClass} aria-hidden />
      <h3 className="text-sm font-semibold text-gray-700">{children}</h3>
      <Badge variant="secondary" className="text-[10px] font-normal">
        {count}
      </Badge>
    </div>
  );
}

/** CP admin/staff user detail — SSR seed + live `useUser`; doctors redirect to `/control-panel/doctors/[id]`. */
export function AdminUserDetailScreen({
  userId,
  canAdminEdit,
  listBackHref,
  scrollShell = "control-panel",
  initialUser,
  appointmentCount,
  emailVerified,
  initialAppointments,
}: AdminUserDetailScreenProps) {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dialogForm, setDialogForm] = useState<AdminUserFormValues>(EMPTY_ADMIN_USER_FORM);
  const [appointments] = useState(initialAppointments);

  useLayoutEffect(() => {
    queryClient.setQueryData(queryKeys.users.detail(userId), initialUser);
  }, [queryClient, userId, initialUser]);

  const { data: user, updateUser, isUpdating } = useUser(userId, { initialData: initialUser });
  const { data: doctorUsersData } = useUsers(CP_DOCTOR_USERS_FILTERS);
  const staffById = useMemo(
    () => buildStaffDirectoryMap({ doctorUsers: doctorUsersData?.users ?? null }),
    [doctorUsersData?.users]
  );

  const liveUser = user ?? initialUser;
  const displayName = liveUser.display_name?.trim() || liveUser.email;
  const roleLabel = liveUser.role
    ? `${liveUser.role.charAt(0).toUpperCase()}${liveUser.role.slice(1)}`
    : "User";

  const recordAuditActors = useMemo(() => mapUserRecordAuditActors(liveUser), [liveUser]);

  const appointmentColumns = useMemo(
    () =>
      buildRelatedAppointmentsColumns({
        viewerRole: "admin",
        patientDisplayName: displayName,
        staffById,
        pagePatient: null,
      }),
    [displayName, staffById]
  );

  const openEditDialog = () => {
    setDialogForm(userToAdminUserForm(liveUser));
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    updateUser(adminUserFormToUpdatePayload(dialogForm), {
      onSuccess: () => setEditDialogOpen(false),
    });
  };

  return (
    <EntityDetailPageShell
      shell={scrollShell}
      header={
        <EntityDetailChromeHeader
          icon={UserCog}
          iconTileClassName={entityDetailChromeVioletIconTileClass}
          iconClassName={entityDetailChromeVioletIconClass}
          className={entityDetailPageHeaderClass}
          title={displayName}
          description={
            <ControlPanelHeaderSubtitle
              lead={`${roleLabel} account —`}
              metric={String(appointmentCount)}
              metricSuffix=" appointments"
            />
          }
          actions={
            <EntityDetailBackLink
              href={listBackHref}
              placement="header"
              backButtonClassName={violetGlassBackButtonClass}
            />
          }
        />
      }
    >

      <Card className={cn("flex-1", adminUserDetailCardFrameClass)}>
        <CardContent className="space-y-3 px-4 sm:px-6 text-gray-700">
          <div className={patientDetailSchemaSectionClass}>
            <div className="flex items-start gap-3">
              <UserAvatar
                src={liveUser.image}
                alt={displayName}
                fallbackText={displayName}
                sizeClassName="h-20 w-20"
                className="rounded-xl ring-2 ring-violet-200/70 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-lg font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">{liveUser.email}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <UserRoleBadge role={liveUser.role} />
                  <EntityActiveStatusBadge active={isUserAccountActive(liveUser)} />
                  <EntityEmailVerificationBadge verified={emailVerified} />
                </div>
              </div>
            </div>

            <dl className={patientDetailDefinitionListClass}>
              <EntityDetailRecordAuditCard
                createdAt={liveUser.created_at}
                updatedAt={liveUser.updated_at}
                createdBy={recordAuditActors.createdBy}
                updatedBy={recordAuditActors.updatedBy}
                viewerRole={"admin" as EntityRole}
                iconCircleClass={adminUserDetailAuditIconCircleClass}
                iconClassName={adminUserDetailFieldIconClass}
              />
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={Hash}>User ID</FieldLabel>
                <dd>
                  <EntityIdCopyInline value={liveUser.id} />
                </dd>
              </div>
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={Mail}>Email</FieldLabel>
                <dd className="text-sm">{liveUser.email}</dd>
              </div>
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={ShieldCheck}>Role</FieldLabel>
                <dd className="capitalize">{clinicalEmptyOr(liveUser.role, "definition")}</dd>
              </div>
              {liveUser.phone?.trim() ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={Phone}>Phone</FieldLabel>
                  <dd className="text-sm">{liveUser.phone}</dd>
                </div>
              ) : null}
              {liveUser.created_at ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={Clock}>Joined</FieldLabel>
                  <dd>{format(new Date(liveUser.created_at), "PP")}</dd>
                </div>
              ) : null}
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={CalendarDays}>Appointments Owned</FieldLabel>
                <dd className="font-medium">{appointmentCount}</dd>
              </div>
            </dl>
          </div>

          <div className={adminUserDetailSnapshotSectionShellClass}>
            <SectionHeading icon={Calendar} count={appointmentCount}>
              Appointments Owned
            </SectionHeading>
            <ClinicalDataTable
              columns={appointmentColumns}
              data={appointments.slice(0, 12)}
              isLoading={false}
              pagination={false}
              tableLayout="fixed"
              emptyMessage="No appointments"
              tableClassName={cn(clinicalSnapshotAppointmentsTableMinWidthClass, "w-full")}
              className={adminUserDetailSnapshotTableFrameClass}
              tableFrameClassName="rounded-md border border-violet-200/80 bg-white shadow-none"
            />
          </div>
        </CardContent>
      </Card>

      <EntityDetailFooterRow
        backHref={listBackHref}
        backButtonClassName={violetGlassBackButtonClass}
        actions={
          canAdminEdit ? (
            <ControlPanelGlassActionButton type="button" variant="violet" onClick={openEditDialog}>
              <Pencil className="shrink-0" aria-hidden />
              Update Profile
            </ControlPanelGlassActionButton>
          ) : undefined
        }
      />

      {canAdminEdit ? (
        <AdminUserFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          readOnlyEmail={liveUser.email}
          form={dialogForm}
          onFormChange={(patch) => setDialogForm((p) => ({ ...p, ...patch }))}
          onSubmit={handleSaveEdit}
          isSubmitting={isUpdating}
          emailVerified={emailVerified}
        />
      ) : null}
    </EntityDetailPageShell>
  );
}
