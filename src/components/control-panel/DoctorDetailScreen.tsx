"use client";

import { useLayoutEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Power,
  PowerOff,
  Stethoscope,
} from "lucide-react";
import { DemoShowcaseFeatureNote } from "@/components/shared/DemoShowcaseFeatureNote";
import { EntityDetailBackLink } from "@/components/shared/entity-detail/EntityDetailBackLink";
import { EntityDetailFooterRow } from "@/components/shared/entity-detail/EntityDetailFooterRow";
import { emeraldGlassBackButtonClass } from "@/lib/calendar-header-action-styles";
import { DoctorAvailabilityEditor } from "@/components/control-panel/DoctorAvailabilityEditor";
import { DoctorAppointmentTypesEditor } from "@/components/control-panel/DoctorAppointmentTypesEditor";
import { DoctorGlobalTypeConfigEditor } from "@/components/control-panel/DoctorGlobalTypeConfigEditor";
import { DoctorFormDialog } from "@/components/control-panel/doctor-dialog/DoctorFormDialog";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { DoctorDetailScreenShared } from "@/components/shared/doctor-detail/DoctorDetailScreenShared";
import { DOCTOR_MANAGEMENT_DEMO_NOTE } from "@/lib/demo-showcase-copy";
import {
  doctorDetailSectionIconCircleClass,
} from "@/lib/doctor-detail-ui-classes";
import type { User } from "@/types/types";
import type { DoctorSnapshot } from "@/types/types";
import { useUser } from "@/hooks/useUsers";
import { queryKeys } from "@/lib/query-keys";
import { isDoctorActive } from "@/lib/entity-active-status";
import {
  doctorFormToUpdatePayload,
  userToDoctorForm,
  type DoctorFormValues,
  EMPTY_DOCTOR_FORM,
} from "@/lib/doctor-form-state";
import type { DoctorAssignedPatientRow } from "@/lib/doctor-assigned-patients";
import type { UsersListResponse } from "@/hooks/useUsers";

export type { DoctorAssignedPatientRow };

type DoctorDetailScreenProps = {
  doctorId: string;
  canAdminEdit: boolean;
  listBackHref: string;
  initialUser: User;
  initialSnapshot: DoctorSnapshot | null;
  initialAssignedPatients: DoctorAssignedPatientRow[];
  initialDoctorUsers?: UsersListResponse | null;
  initialAdminUsers?: UsersListResponse | null;
};

/** CP doctor detail — SSR seed + shared schema/snapshots; schedule editors in `middleSlot`. */
export function DoctorDetailScreen({
  doctorId,
  canAdminEdit,
  listBackHref,
  initialUser,
  initialSnapshot,
  initialAssignedPatients,
  initialDoctorUsers,
  initialAdminUsers,
}: DoctorDetailScreenProps) {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [dialogForm, setDialogForm] = useState<DoctorFormValues>(EMPTY_DOCTOR_FORM);

  useLayoutEffect(() => {
    queryClient.setQueryData(queryKeys.users.detail(doctorId), initialUser);
    queryClient.setQueryData(
      queryKeys.doctors.assignedPatients(doctorId),
      initialAssignedPatients
    );
    if (initialSnapshot != null) {
      queryClient.setQueryData(queryKeys.doctors.snapshot(doctorId), initialSnapshot);
    }
  }, [queryClient, doctorId, initialUser, initialAssignedPatients, initialSnapshot]);

  const { data: user, updateUser, isUpdating } = useUser(doctorId);
  const liveUser = user ?? initialUser;
  const displayName = liveUser.display_name?.trim() || liveUser.email;
  const active = isDoctorActive(liveUser);

  const openEditDialog = () => {
    setDialogForm(userToDoctorForm(liveUser));
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    updateUser(doctorFormToUpdatePayload(dialogForm));
    setEditDialogOpen(false);
  };

  const handleToggleActive = () => {
    updateUser({ is_active: !active });
    setConfirmToggleOpen(false);
  };

  const middleSlot = (
    <>
      <DoctorAvailabilityEditor doctorId={doctorId} />

      <div className="space-y-3 rounded-xl border border-emerald-100/60 bg-emerald-50/20 p-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span className={doctorDetailSectionIconCircleClass}>
            <Stethoscope className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          </span>
          Additional Appointment Types
        </h3>
        <DoctorAppointmentTypesEditor doctorId={doctorId} />
      </div>

      <div className="space-y-3 rounded-xl border border-sky-100/60 bg-sky-50/20 p-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span className={doctorDetailSectionIconCircleClass}>
            <Stethoscope className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          </span>
          Appointment type access
        </h3>
        <DoctorGlobalTypeConfigEditor doctorId={doctorId} />
      </div>
    </>
  );

  const footerSlot = (
    <EntityDetailFooterRow
      backHref={listBackHref}
      backButtonClassName={emeraldGlassBackButtonClass}
      actions={
        canAdminEdit ? (
          <>
            <ControlPanelGlassActionButton type="button" variant="emerald" onClick={openEditDialog}>
              <Pencil className="shrink-0" aria-hidden />
              Update Profile
            </ControlPanelGlassActionButton>
            <ControlPanelGlassActionButton
              type="button"
              variant={active ? "rose" : "emerald"}
              onClick={() => setConfirmToggleOpen(true)}
            >
              {active ? (
                <PowerOff className="shrink-0" aria-hidden />
              ) : (
                <Power className="shrink-0" aria-hidden />
              )}
              {active ? "Deactivate" : "Activate"}
            </ControlPanelGlassActionButton>
          </>
        ) : undefined
      }
    />
  );

  return (
    <>
      <DoctorDetailScreenShared
        tone="emerald"
        mode="control-panel"
        doctorId={doctorId}
        backHref={listBackHref}
        viewerRole="admin"
        initialUser={initialUser}
        initialSnapshot={initialSnapshot}
        initialAssignedPatients={initialAssignedPatients}
        showAssignedPatientsSection
        initialDoctorUsers={initialDoctorUsers}
        initialAdminUsers={initialAdminUsers}
        topSlot={<DemoShowcaseFeatureNote note={DOCTOR_MANAGEMENT_DEMO_NOTE} />}
        middleSlot={middleSlot}
        footerSlot={footerSlot}
      />

      {canAdminEdit ? (
        <>
          <DoctorFormDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            readOnlyEmail={liveUser.email}
            form={dialogForm}
            onFormChange={(patch) => setDialogForm((p) => ({ ...p, ...patch }))}
            onSubmit={handleSaveEdit}
            isSubmitting={isUpdating}
          />
          <ConfirmActionDialog
            open={confirmToggleOpen}
            onOpenChange={setConfirmToggleOpen}
            title={active ? "Deactivate this doctor?" : "Activate this doctor?"}
            subtitle={
              active
                ? `${displayName} will remain visible in lists but not selectable for new appointments.`
                : `${displayName} will become available for new bookings again.`
            }
            confirmLabel={active ? "Deactivate" : "Activate"}
            variant={active ? "warning" : "info"}
            onConfirm={handleToggleActive}
          />
        </>
      ) : null}
    </>
  );
}
