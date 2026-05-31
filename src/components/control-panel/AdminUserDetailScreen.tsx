"use client";

import { useLayoutEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Hash,
  Mail,
  Pencil,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { AdminUserFormDialog } from "@/components/control-panel/admin-user-dialog/AdminUserFormDialog";
import {
  adminUserDetailCardFrameClass,
  adminUserDetailFieldIconCircleClass,
} from "@/lib/admin-user-detail-ui-classes";
import {
  entityDetailActionsRowClass,
  entityDetailPageHeaderClass,
  patientDetailDefinitionListClass,
  patientDetailDefinitionRowClass,
  patientDetailSchemaSectionClass,
} from "@/lib/patient-detail-ui-classes";
import { resolveEntityDetailRootClass } from "@/lib/section-page-layout";
import type { AppSectionScrollShell } from "@/lib/section-page-layout";
import type { User } from "@/types/types";
import { useUser } from "@/hooks/useUsers";
import { queryKeys } from "@/lib/query-keys";
import {
  adminUserFormToUpdatePayload,
  EMPTY_ADMIN_USER_FORM,
  userToAdminUserForm,
  type AdminUserFormValues,
} from "@/lib/admin-user-form-state";
import { cn } from "@/lib/utils";

type AdminUserDetailScreenProps = {
  userId: string;
  canAdminEdit: boolean;
  listBackHref: string;
  scrollShell?: AppSectionScrollShell;
  initialUser: User;
  appointmentCount: number;
  emailVerified: boolean;
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

/** CP admin/staff user detail — SSR seed + live `useUser`; doctors redirect to `/control-panel/doctors/[id]`. */
export function AdminUserDetailScreen({
  userId,
  canAdminEdit,
  listBackHref,
  scrollShell = "control-panel",
  initialUser,
  appointmentCount,
  emailVerified,
}: AdminUserDetailScreenProps) {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dialogForm, setDialogForm] = useState<AdminUserFormValues>(EMPTY_ADMIN_USER_FORM);

  useLayoutEffect(() => {
    queryClient.setQueryData(queryKeys.users.detail(userId), initialUser);
  }, [queryClient, userId, initialUser]);

  const { data: user, updateUser, isUpdating } = useUser(userId);
  const liveUser = user ?? initialUser;
  const displayName = liveUser.display_name?.trim() || liveUser.email;

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
      <PageHeader
        className={entityDetailPageHeaderClass}
        title={displayName}
        description={
          liveUser.role
            ? `${liveUser.role.charAt(0).toUpperCase()}${liveUser.role.slice(1)} Account`
            : "User Account"
        }
        actions={
          <BackNavigationLink href={listBackHref} className="no-underline">
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
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={Hash}>User ID</FieldLabel>
                <dd className="font-mono text-xs break-all">{liveUser.id}</dd>
              </div>
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={Mail}>Email</FieldLabel>
                <dd className="text-sm">{liveUser.email}</dd>
              </div>
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={ShieldCheck}>Role</FieldLabel>
                <dd className="capitalize">{liveUser.role ?? "—"}</dd>
              </div>
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
        </CardContent>
      </Card>

      {canAdminEdit ? (
        <div className={entityDetailActionsRowClass}>
          <BackNavigationLink href={listBackHref} className="no-underline">
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
        />
      ) : null}
    </div>
  );
}
