"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useLayoutEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  BookOpen,
  BadgeDollarSign,
  Building2,
  Hash,
  Languages,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Power,
  PowerOff,
  ShieldCheck,
  Stethoscope,
  User as UserIcon,
  Users,
  Clock,
} from "lucide-react";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { DemoShowcaseFeatureNote } from "@/components/shared/DemoShowcaseFeatureNote";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { EntityActiveStatusBadge } from "@/components/shared/entity-display/EntityActiveStatusBadge";
import { ClinicalDataTable } from "@/components/shared/ClinicalDataTable";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { DoctorAvailabilityEditor } from "@/components/control-panel/DoctorAvailabilityEditor";
import { DoctorAppointmentTypesEditor } from "@/components/control-panel/DoctorAppointmentTypesEditor";
import { DoctorGlobalTypeConfigEditor } from "@/components/control-panel/DoctorGlobalTypeConfigEditor";
import { DoctorFormDialog } from "@/components/control-panel/doctor-dialog/DoctorFormDialog";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import { entityDetailOwnedSnapshotSectionTitle } from "@/lib/entity-detail-snapshot-section-copy";
import { DOCTOR_MANAGEMENT_DEMO_NOTE } from "@/lib/demo-showcase-copy";
import {
  doctorDetailCardFrameClass,
  doctorDetailFieldIconCircleClass,
  doctorDetailSectionIconCircleClass,
} from "@/lib/doctor-detail-ui-classes";
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
import type { User } from "@/types/types";
import { useUser } from "@/hooks/useUsers";
import { queryKeys } from "@/lib/query-keys";
import { isDoctorActive } from "@/lib/entity-active-status";
import { clinicalEmptyOr } from "@/components/shared/ClinicalTableEmptyDash";
import {
  doctorFormToUpdatePayload,
  userToDoctorForm,
  type DoctorFormValues,
  EMPTY_DOCTOR_FORM,
} from "@/lib/doctor-form-state";
import { cn } from "@/lib/utils";
import type { DoctorAssignedPatientRow } from "@/lib/doctor-assigned-patients";
import { useDoctorAssignedPatients } from "@/hooks/useDoctorAssignedPatients";

export type { DoctorAssignedPatientRow };

type DoctorDetailScreenProps = {
  doctorId: string;
  canAdminEdit: boolean;
  listBackHref: string;
  scrollShell?: AppSectionScrollShell;
  initialUser: User;
  initialAssignedPatients: DoctorAssignedPatientRow[];
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
      <span className={doctorDetailFieldIconCircleClass}>
        <Icon className="h-3 w-3 text-emerald-600" aria-hidden />
      </span>
      {children}
    </dt>
  );
}

/** CP doctor detail — SSR seed + emerald chrome; schedule editors stay mounted. */
export function DoctorDetailScreen({
  doctorId,
  canAdminEdit,
  listBackHref,
  scrollShell = "control-panel",
  initialUser,
  initialAssignedPatients,
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
  }, [queryClient, doctorId, initialUser, initialAssignedPatients]);

  const { data: user, updateUser, isUpdating } = useUser(doctorId);
  const {
    data: assignedPatients = initialAssignedPatients,
    isLoading: assignedPatientsLoading,
  } = useDoctorAssignedPatients(doctorId, { initialData: initialAssignedPatients });
  const assignedPatientsLoadingUi =
    assignedPatientsLoading && assignedPatients.length === 0;
  const liveUser = user ?? initialUser;
  const displayName = liveUser.display_name?.trim() || liveUser.email;
  const active = isDoctorActive(liveUser);

  const patientColumns: ColumnDef<DoctorAssignedPatientRow>[] = useMemo(
    () => [
      {
        id: "patient",
        header: "Patient",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <PatientIdentityCell
              href={`/control-panel/patients/${p.id}`}
              name={`${p.firstname} ${p.lastname}`.trim()}
              email={p.email}
              patient={{
                id: p.id,
                firstname: p.firstname,
                lastname: p.lastname,
                email: p.email ?? "",
                birth_date: p.birth_date ?? null,
              }}
              layout="table"
            />
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <EntityActiveStatusBadge active={row.original.active !== false} />
        ),
      },
    ],
    []
  );

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

  const patientsSectionTitle = entityDetailOwnedSnapshotSectionTitle(
    displayName,
    "assignedPatients",
    "doctor"
  );

  return (
    <div className={resolveEntityDetailRootClass(scrollShell)}>
      <PageHeader
        className={entityDetailPageHeaderClass}
        title={displayName}
        description={
          liveUser.specialty
            ? `${liveUser.specialty} · Doctor Profile`
            : "Doctor Profile"
        }
        actions={
          <BackNavigationLink href={listBackHref} className="no-underline">
            <ArrowLeft className="shrink-0" aria-hidden />
            Back
          </BackNavigationLink>
        }
      />

      <DemoShowcaseFeatureNote note={DOCTOR_MANAGEMENT_DEMO_NOTE} />

      <Card className={cn("flex-1", doctorDetailCardFrameClass)}>
        <CardContent className="space-y-3 px-4 sm:px-6 text-gray-700">
          <div className={patientDetailSchemaSectionClass}>
            <div className="flex items-start gap-3">
              <UserAvatar
                src={liveUser.image}
                alt={displayName}
                fallbackText={displayName}
                sizeClassName="h-20 w-20"
                className="rounded-xl ring-2 ring-emerald-200/70 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-lg font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">{liveUser.email}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {liveUser.specialty ? (
                    <DoctorSpecialtyBadge specialty={liveUser.specialty} />
                  ) : null}
                  <EntityActiveStatusBadge active={active} />
                </div>
              </div>
            </div>

            <dl className={patientDetailDefinitionListClass}>
              {liveUser.bio ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={BookOpen}>Bio</FieldLabel>
                  <dd className="min-w-0 text-sm text-gray-700 whitespace-pre-wrap">
                    {liveUser.bio}
                  </dd>
                </div>
              ) : null}
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={Hash}>Doctor ID</FieldLabel>
                <dd className="font-mono text-xs break-all">{liveUser.id}</dd>
              </div>
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={Mail}>Email</FieldLabel>
                <dd className="text-sm">{liveUser.email}</dd>
              </div>
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={Stethoscope}>Specialty</FieldLabel>
                <dd>{clinicalEmptyOr(liveUser.specialty, "definition")}</dd>
              </div>
              {liveUser.phone ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={Phone}>Phone</FieldLabel>
                  <dd className="text-sm">{liveUser.phone}</dd>
                </div>
              ) : null}
              {liveUser.license_number ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={ShieldCheck}>License #</FieldLabel>
                  <dd className="font-mono text-xs">{liveUser.license_number}</dd>
                </div>
              ) : null}
              {liveUser.department ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={Building2}>Department</FieldLabel>
                  <dd className="text-sm">{liveUser.department}</dd>
                </div>
              ) : null}
              {liveUser.office_location ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={MapPin}>Office</FieldLabel>
                  <dd className="text-sm">{liveUser.office_location}</dd>
                </div>
              ) : null}
              {(liveUser.consultation_fee ?? 0) > 0 ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={BadgeDollarSign}>Consultation fee</FieldLabel>
                  <dd>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      €{((liveUser.consultation_fee ?? 0) / 100).toFixed(2)}
                    </span>
                  </dd>
                </div>
              ) : null}
              {liveUser.years_of_experience != null ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={Clock}>Experience</FieldLabel>
                  <dd className="text-sm">{liveUser.years_of_experience} {liveUser.years_of_experience === 1 ? "year" : "years"}</dd>
                </div>
              ) : null}
              {(liveUser.languages_spoken ?? []).length > 0 ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={Languages}>Languages</FieldLabel>
                  <dd className="flex flex-wrap gap-1">
                    {(liveUser.languages_spoken ?? []).map((lang) => (
                      <span key={lang} className="rounded-full border border-sky-200/70 bg-sky-50/80 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                        {lang}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
              {liveUser.created_at ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={UserIcon}>Joined</FieldLabel>
                  <dd>{format(new Date(liveUser.created_at), "PP")}</dd>
                </div>
              ) : null}
            </dl>
          </div>

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

          <div className={entityDetailSnapshotSectionShellClass}>
            <EntityDetailSnapshotSectionHeading
              icon={Users}
              sectionIconCircleClass={doctorDetailSectionIconCircleClass}
              iconClassName="h-3.5 w-3.5 text-emerald-600"
              count={assignedPatients.length}
            >
              {patientsSectionTitle}
            </EntityDetailSnapshotSectionHeading>
            <ClinicalDataTable
              columns={patientColumns}
              data={assignedPatients}
              isLoading={assignedPatientsLoadingUi}
              pagination={false}
              emptyMessage="No patients assigned as primary doctor."
              tableClassName="min-w-[520px] w-full"
              className={patientDetailSnapshotTableFrameClass}
              tableFrameClassName="rounded-md border border-slate-200/80 bg-white shadow-none"
            />
          </div>
        </CardContent>
      </Card>

      {canAdminEdit ? (
        <div className={entityDetailActionsRowClass}>
          <BackNavigationLink href={listBackHref} className="no-underline">
            <ArrowLeft className="shrink-0" aria-hidden />
            Back To List
          </BackNavigationLink>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      ) : null}

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
    </div>
  );
}
