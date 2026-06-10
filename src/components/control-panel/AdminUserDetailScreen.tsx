"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { clinicalEmptyOr } from "@/components/shared/ClinicalTableEmptyDash";
import {
  ArrowLeft,
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
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { ControlPanelHeaderSubtitle } from "@/components/control-panel/ControlPanelHeaderSubtitle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { EntityActiveStatusBadge } from "@/components/shared/entity-display/EntityActiveStatusBadge";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { AdminUserFormDialog } from "@/components/control-panel/admin-user-dialog/AdminUserFormDialog";
import { ClinicalDataTable } from "@/components/shared/ClinicalDataTable";
import { buildRelatedAppointmentsColumns } from "@/components/control-panel/patient-detail-snapshot-columns";
import {
  adminUserDetailCardFrameClass,
  adminUserDetailFieldIconCircleClass,
} from "@/lib/admin-user-detail-ui-classes";
import {
  entityDetailChromeSlateIconClass,
  entityDetailChromeSlateIconTileClass,
} from "@/lib/page-chrome-classes";
import {
  entityDetailActionsRowClass,
  entityDetailPageHeaderClass,
  entityDetailSnapshotSectionShellClass,
  patientDetailDefinitionListClass,
  patientDetailDefinitionRowClass,
  patientDetailSchemaSectionClass,
  patientDetailSnapshotTableFrameClass,
} from "@/lib/patient-detail-ui-classes";
import { resolveEntityDetailRootClass } from "@/lib/section-page-layout";
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
import { entityDetailAuditIconCircleClass } from "@/lib/patient-detail-ui-classes";
import type { EntityRole } from "@/lib/entity-routes";
import { skyGlassBackButtonClass } from "@/lib/calendar-header-action-styles";
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
        <Icon className="h-3 w-3 text-slate-600" aria-hidden />
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
      <Icon className="h-4 w-4 text-slate-600" aria-hidden />
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
    updateUser(adminUserFormToUpdatePayload(dialogForm));
    setEditDialogOpen(false);
  };

  return (
    <div className={resolveEntityDetailRootClass(scrollShell)}>
      <EntityDetailChromeHeader
        icon={UserCog}
        iconTileClassName={entityDetailChromeSlateIconTileClass}
        iconClassName={entityDetailChromeSlateIconClass}
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
          <BackNavigationLink
            href={listBackHref}
            className={cn(skyGlassBackButtonClass, "no-underline")}
          >
            <ArrowLeft className="shrink-0" aria-hidden />
            Back
          </BackNavigationLink>
        }
      />

      <Card className={cn("flex-1", adminUserDetailCardFrameClass)}>
        <CardContent className="space-y-3 px-4 sm:px-6 text-gray-700">
          <div className={patientDetailSchemaSectionClass}>
            <div className="flex items-start gap-3">
              <UserAvatar
                src={liveUser.image}
                alt={displayName}
                fallbackText={displayName}
                sizeClassName="h-20 w-20"
                className="rounded-xl ring-2 ring-slate-200/70 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-lg font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">{liveUser.email}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <UserRoleBadge role={liveUser.role} />
                  <EntityActiveStatusBadge active={isUserAccountActive(liveUser)} />
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] py-0",
                      emailVerified
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}
                  >
                    {emailVerified ? "Verified" : "Unverified"}
                  </Badge>
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
                iconCircleClass={entityDetailAuditIconCircleClass}
                iconClassName="h-3 w-3 text-sky-600"
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

          <div className={entityDetailSnapshotSectionShellClass}>
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
              className={patientDetailSnapshotTableFrameClass}
              tableFrameClassName="rounded-md border border-slate-200/80 bg-white shadow-none"
            />
          </div>
        </CardContent>
      </Card>

      {canAdminEdit ? (
        <div className={entityDetailActionsRowClass}>
          <BackNavigationLink
            href={listBackHref}
            className={cn(skyGlassBackButtonClass, "no-underline")}
          >
            <ArrowLeft className="shrink-0" aria-hidden />
            Back To List
          </BackNavigationLink>
          <ControlPanelGlassActionButton type="button" variant="sky" onClick={openEditDialog}>
            <Pencil className="shrink-0" aria-hidden />
            Update Profile
          </ControlPanelGlassActionButton>
        </div>
      ) : null}

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
    </div>
  );
}
