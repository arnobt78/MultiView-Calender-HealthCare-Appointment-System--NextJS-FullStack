"use client";

import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  FileText,
  Hash,
  Lock,
  MapPin,
  Receipt,
  Stethoscope,
  Tags,
  User,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityDetailBackLink } from "@/components/shared/entity-detail/EntityDetailBackLink";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";
import { CategoryInlineLink } from "@/components/shared/CategoryInlineLink";
import { AppointmentVisitMetaBadgeRow } from "@/components/shared/appointment-display/AppointmentVisitMetaBadgeRow";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { resolveAppointmentDisplayLocation } from "@/lib/appointment-visit-location";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { DoctorIdentityCell } from "@/components/shared/person-display/DoctorIdentityCell";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import { EntityDetailRecordAuditCard } from "@/components/shared/entity-detail/EntityDetailRecordAuditCard";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { AppointmentDetailBodySkeleton } from "@/components/shared/appointment-detail/AppointmentDetailBodySkeleton";
import { AppointmentDetailActionBar } from "@/components/shared/appointment-detail/AppointmentDetailActionBar";
import { AppointmentDetailHeaderQuickActions } from "@/components/shared/appointment-detail/AppointmentDetailHeaderQuickActions";
import AppointmentDialogController from "@/components/calendar/AppointmentDialogController";
import { InvoiceClinicalListTable } from "@/components/shared/billing/InvoiceClinicalListTable";
import { clinicalEmptyOr } from "@/components/shared/ClinicalTableEmptyDash";
import { buildStaffDirectoryMap } from "@/lib/staff-directory-cache";
import { seedUsersListCache, seedInvoicesListCache } from "@/lib/ssr-query-seed";
import { seedGoogleCalendarStatusCacheFromSsr, seedDoctorsDirectoryCacheFromSsr } from "@/lib/cp-list-query-ssr-seed";
import {
  APPOINTMENT_DETAIL_ADMIN_USERS_FILTERS,
  APPOINTMENT_DETAIL_DOCTOR_USERS_FILTERS,
  resolveAppointmentDetailToneClasses,
  type AppointmentDetailTone,
} from "@/lib/appointment-detail-ui-classes";
import {
  entityDetailDefinitionIdentityRowClass,
  entityDetailDefinitionIdentityValueClass,
  entityDetailDefinitionValueClass,
  entityDetailPageHeaderClass,
  entityDetailSnapshotSectionShellClass,
} from "@/lib/patient-detail-ui-classes";
import { entityDetailOwnedSnapshotSectionTitle } from "@/lib/entity-detail-snapshot-section-copy";
import { buildAppointmentInvoiceAuditExtraRows } from "@/lib/appointment-detail-invoice-audit-rows";
import { buildFullAppointmentForDialog } from "@/lib/appointment-detail-dialog";
import { prefetchAppointmentDetailEditWarmup } from "@/lib/prefetch-appointment-detail-edit";
import {
  resolvePrimaryDoctorDisplayName,
} from "@/lib/staff-directory-cache";
import { EntityDetailPageShell } from "@/components/shared/entity-detail/EntityDetailPageShell";
import type { AppSectionScrollShell } from "@/lib/section-page-layout";
import { categoryDetailHref, patientDetailHref, type EntityRole } from "@/lib/entity-routes";
import {
  resolveCalendarOwnerLinkKind,
  resolvePortalAppointmentDetailLinkPolicy,
  resolveTreatingPhysicianLinkKind,
} from "@/lib/entity-detail-snapshot-links";
import { canShowAppointmentClinicalNotes } from "@/lib/portal-appointment-card-visibility";
import { canClientFetchAdminUsersList } from "@/lib/user-list-access";
import { useAppointmentDetail } from "@/hooks/useAppointmentDetail";
import { useUsers, type UsersListResponse } from "@/hooks/useUsers";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import { queryKeys } from "@/lib/query-keys";
import { filterInvoicesForAppointment } from "@/lib/invoice-entity-list-filters";
import { mapAppointmentDetailToBillingOption } from "@/lib/billing-appointment-option-from-detail";
import { seedBillingAppointmentOptionsCache } from "@/lib/billing-appointment-options-cache";
import { cn } from "@/lib/utils";
import type { AppointmentAssignee } from "@/types/types";
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";
import type { GoogleCalendarStatus } from "@/types/google-calendar";
import type { DoctorPrefetchRow } from "@/lib/server-prefetch";
import {
  clinicianDisplayNameOnly,
  recomputeAppointmentDetailLabels,
} from "@/lib/appointment-detail-view-model";
import {
  resolveAppointmentVisitMetaBilling,
  resolveAppointmentVisitMetaFromFullAppointment,
} from "@/lib/appointment-visit-meta-resolve";
export type AppointmentDetailScreenSharedProps = {
  tone: AppointmentDetailTone;
  mode: "portal" | "control-panel";
  backHref: string;
  backListLabel: string;
  initialDetail: AppointmentDetailViewModel;
  initialDoctorUsers?: UsersListResponse | null;
  initialAdminUsers?: UsersListResponse | null;
  initialInvoices?: Invoice[] | null;
  /** Staff Google Calendar connection — seeds sync footer on first paint. */
  initialGoogleCalendarStatus?: GoogleCalendarStatus | null;
  /** Doctor directory — seeds `queryKeys.doctors.all` for edit-dialog picker. */
  initialDoctorsDirectory?: { doctors: DoctorPrefetchRow[] } | null;
};

function FieldLabel({
  icon: Icon,
  toneClasses,
  children,
}: {
  icon: LucideIcon;
  toneClasses: ReturnType<typeof resolveAppointmentDetailToneClasses>;
  children: React.ReactNode;
}) {
  return (
    <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500 sm:pt-0.5">
      <span className={toneClasses.fieldIconCircleClass}>
        <Icon className={toneClasses.fieldIconClass} aria-hidden />
      </span>
      {children}
    </dt>
  );
}

function DefinitionRow({
  icon,
  label,
  toneClasses,
  identity = false,
  children,
}: {
  icon: LucideIcon;
  label: string;
  toneClasses: ReturnType<typeof resolveAppointmentDetailToneClasses>;
  /** Related People rows — center avatar row on y-axis with label. */
  identity?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        identity ? entityDetailDefinitionIdentityRowClass : toneClasses.definitionRowClass
      }
    >
      <FieldLabel icon={icon} toneClasses={toneClasses}>
        {label}
      </FieldLabel>
      <dd
        className={
          identity ? entityDetailDefinitionIdentityValueClass : entityDetailDefinitionValueClass
        }
      >
        {children}
      </dd>
    </div>
  );
}

/**
 * Shared appointment detail — CP (violet) and portal (sky) glass entity layout.
 */
export function AppointmentDetailScreenShared({
  tone,
  mode,
  backHref,
  backListLabel,
  initialDetail,
  initialDoctorUsers,
  initialAdminUsers,
  initialInvoices,
  initialGoogleCalendarStatus,
  initialDoctorsDirectory,
}: AppointmentDetailScreenSharedProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const didOpenEditFromUrlRef = useRef(false);

  const toneClasses = resolveAppointmentDetailToneClasses(tone);
  const scrollShell: AppSectionScrollShell =
    mode === "control-panel" ? "control-panel" : "portal";
  const entityRole = initialDetail.viewerRole as EntityRole;
  const canEdit = initialDetail.accessLevel === "mutate";

  const appointmentId = initialDetail.appointmentId;

  const detailQueryKey = queryKeys.appointments.detail(appointmentId);
  const { data: detail = initialDetail, isLoading: detailQueryLoading } = useAppointmentDetail(
    appointmentId,
    {
      initialData: initialDetail,
    }
  );
  const detailBodyLoading = useCpListBodyLoading(detailQueryKey, detailQueryLoading);
  const hasAppointmentBody = Boolean(detail?.appointment?.id);
  const showBodySkeleton = !hasAppointmentBody && detailBodyLoading;
  const showLiveBody = hasAppointmentBody;

  /** One-shot SSR seeds — keyed by id so object identity changes do not re-trigger setQueryData loops. */
  const ancillarySeededRef = useRef(false);
  useLayoutEffect(() => {
    if (ancillarySeededRef.current) return;
    if (initialDoctorUsers != null) {
      seedUsersListCache(queryClient, APPOINTMENT_DETAIL_DOCTOR_USERS_FILTERS, initialDoctorUsers);
    }
    if (initialAdminUsers != null) {
      seedUsersListCache(queryClient, APPOINTMENT_DETAIL_ADMIN_USERS_FILTERS, initialAdminUsers);
    }
    if (initialInvoices != null) {
      seedInvoicesListCache(queryClient, initialInvoices);
    }
    seedGoogleCalendarStatusCacheFromSsr(
      queryClient,
      initialGoogleCalendarStatus ?? undefined
    );
    seedDoctorsDirectoryCacheFromSsr(queryClient, initialDoctorsDirectory ?? undefined);
    ancillarySeededRef.current = true;
  }, [
    queryClient,
    appointmentId,
    initialDoctorUsers,
    initialAdminUsers,
    initialInvoices,
    initialGoogleCalendarStatus,
    initialDoctorsDirectory,
  ]);

  /** Warm doctor directory before first Update Appointment — complements SSR seed + dialog mount query. */
  useEffect(() => {
    if (!canEdit || !hasAppointmentBody) return;
    const appt = detail.appointment;
    prefetchAppointmentDetailEditWarmup(queryClient, {
      treatingPhysicianId: appt.treating_physician_id ?? detail.treatingPhysician?.id,
      calendarOwnerId: appt.user_id ?? detail.calendarOwner?.id,
      appointmentTypeId: appt.appointment_type_id,
      appointmentStart: appt.start,
      excludeAppointmentId: appt.id,
    });
  }, [canEdit, hasAppointmentBody, detail, queryClient]);

  const staffViewer = entityRole === "admin" || entityRole === "doctor";
  const { data: doctorUsers } = useUsers(APPOINTMENT_DETAIL_DOCTOR_USERS_FILTERS, {
    enabled: staffViewer,
    initialData: staffViewer ? initialDoctorUsers ?? undefined : undefined,
  });
  const { data: adminUsers } = useUsers(APPOINTMENT_DETAIL_ADMIN_USERS_FILTERS, {
    enabled: staffViewer && canClientFetchAdminUsersList(entityRole),
    initialData: staffViewer ? initialAdminUsers ?? undefined : undefined,
  });
  const { invoices, isLoading: invoicesLoading } = usePayments({
    invoicesInitialData: initialInvoices ?? undefined,
  });
  const billingBadgesLoading = useCpListBodyLoading(
    queryKeys.invoices.all,
    invoicesLoading
  );

  const staffById = useMemo(
    () =>
      buildStaffDirectoryMap({
        doctorUsers: doctorUsers?.users ?? null,
        adminUsers: adminUsers?.users ?? null,
      }),
    [doctorUsers?.users, adminUsers?.users]
  );

  const linkPolicy = useMemo(
    () => (mode === "portal" ? resolvePortalAppointmentDetailLinkPolicy(entityRole) : undefined),
    [mode, entityRole]
  );

  const linkPatientInTitle = linkPolicy?.patientInTitle ?? true;

  const appointment = detail.appointment;
  const patient = detail.patient;
  const category = detail.category;
  const showNotes = canShowAppointmentClinicalNotes(entityRole);

  const linkedInvoices = useMemo(
    () => filterInvoicesForAppointment(invoices ?? [], appointment.id),
    [invoices, appointment.id]
  );

  /** Warm invoice create picker from detail cache — avoids VisitPickerSkeleton on Create Invoice. */
  useLayoutEffect(() => {
    if (!hasAppointmentBody) return;
    const option = mapAppointmentDetailToBillingOption(detail, linkedInvoices);
    seedBillingAppointmentOptionsCache(queryClient, appointment.id, false, {
      options: [option],
    });
  }, [queryClient, detail, linkedInvoices, appointment.id, hasAppointmentBody]);

  const visitMeta = useMemo(
    () => resolveAppointmentVisitMetaFromFullAppointment(appointment),
    [appointment]
  );

  const visitMetaBilling = useMemo(
    () => resolveAppointmentVisitMetaBilling(linkedInvoices[0] ?? null),
    [linkedInvoices]
  );

  const assigneesForMenu: AppointmentAssignee[] = useMemo(
    () =>
      detail.assignees.map((a) => ({
        id: a.id,
        created_at: appointment.created_at ?? new Date().toISOString(),
        appointment: appointment.id,
        user: a.userId,
        user_type: "patients" as const,
        invited_email: a.invited_email ?? undefined,
        permission: (a.permission as AppointmentAssignee["permission"]) ?? "read",
        status: (a.status as AppointmentAssignee["status"]) ?? "pending",
      })),
    [detail.assignees, appointment.id, appointment.created_at]
  );

  const fullAppointmentForDialog = useMemo(
    () => buildFullAppointmentForDialog(detail, assigneesForMenu),
    [detail, assigneesForMenu]
  );

  const openEditDialog = useCallback(() => {
    if (!canEdit || !hasAppointmentBody) return;
    setEditDialogOpen(true);
  }, [canEdit, hasAppointmentBody]);

  /** Legacy `?mode=edit` deep links open the shared glass dialog (not inline form). */
  useEffect(() => {
    if (didOpenEditFromUrlRef.current) return;
    if (!canEdit || searchParams.get("mode") !== "edit" || !hasAppointmentBody) return;
    didOpenEditFromUrlRef.current = true;
    const raf = window.requestAnimationFrame(() => {
      openEditDialog();
      router.replace(pathname);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [canEdit, searchParams, hasAppointmentBody, openEditDialog, router, pathname]);

  const ownerLinkKind = resolveCalendarOwnerLinkKind(
    entityRole,
    detail.calendarOwner?.role ?? null,
    linkPolicy
  );
  const treatingLinkKind = resolveTreatingPhysicianLinkKind(
    entityRole,
    linkPolicy,
    detail.treatingPhysician?.role ?? "doctor"
  );


  const primaryDoctorName = useMemo(
    () =>
      patient
        ? resolvePrimaryDoctorDisplayName(patient, staffById, detail.treatingPhysician)
        : "—",
    [patient, staffById, detail.treatingPhysician]
  );

  const invoiceAuditExtraRows = useMemo(
    () => buildAppointmentInvoiceAuditExtraRows(linkedInvoices, entityRole),
    [linkedInvoices, entityRole]
  );

  /** Live schedule fields — avoids stale SSR subtitle when `refetchOnMount` is false. */
  const headerSubtitle = useMemo(
    () =>
      recomputeAppointmentDetailLabels({ appointment, patient }).subtitle,
    [appointment, patient]
  );

  const relatedPeopleTitle = entityDetailOwnedSnapshotSectionTitle(
    appointment.title,
    "relatedPeople",
    "appointment"
  );
  const relatedBillingTitle = entityDetailOwnedSnapshotSectionTitle(
    appointment.title,
    "relatedBilling",
    "appointment"
  );

  const categoryHref =
    category && (linkPolicy?.categoryLink ?? true)
      ? categoryDetailHref(entityRole, category.id)
      : null;

  /** SSR seed paints chrome immediately; body skeleton only when detail cache is cold. */
  const showLive = showLiveBody;

  return (
    <EntityDetailPageShell
      shell={scrollShell}
      header={
        <EntityDetailChromeHeader
          className={entityDetailPageHeaderClass}
          icon={Calendar}
          iconTileClassName={toneClasses.chromeIconTileClass}
          iconClassName={toneClasses.chromeIconClass}
          title={
            showLive ? (
              <span className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="min-w-0 truncate">{appointment.title}</span>
                {appointment.is_telehealth ? <TelehealthSessionBadge /> : null}
              </span>
            ) : (
              <Skeleton className="h-7 w-64 max-w-full" aria-hidden />
            )
          }
          description={showLive ? headerSubtitle : "Appointment details"}
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <EntityDetailBackLink
                href={backHref}
                placement="header"
                backButtonClassName={toneClasses.backButtonClass}
              />
              {showLiveBody ? (
                <AppointmentDetailHeaderQuickActions
                  appointment={appointment}
                  assignees={assigneesForMenu}
                  canEdit={canEdit}
                />
              ) : null}
            </div>
          }
        />
      }
    >

      {!canEdit && showLiveBody ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-900">
          <Lock className="h-4 w-4 shrink-0" aria-hidden />
          Read-only — only the calendar owner or invited editors can change this visit.
        </div>
      ) : null}

      <Card
        className={cn(
          "flex-1 bg-white/90 text-gray-700",
          toneClasses.cardBorderClass,
          toneClasses.cardFrameClass
        )}
      >
        <CardContent className="space-y-3 px-4 sm:px-6 text-gray-700">
          <div className="min-h-6">
            <h2 className="text-lg font-semibold text-gray-700">Visit Overview</h2>
          </div>

          {showBodySkeleton ? (
            <AppointmentDetailBodySkeleton tone={tone} toneClasses={toneClasses} />
          ) : (
            <>
              <div className={toneClasses.schemaSectionClass}>
                <div className="flex flex-wrap items-start gap-3">
                  {category ? (
                    <CategoryBrandMark
                      color={category.color}
                      icon={category.icon}
                      variant="brand"
                      size="hero"
                      className="shrink-0"
                    />
                  ) : (
                    <Skeleton className="h-16 w-16 shrink-0 rounded-full" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1 space-y-2">
                    {/* Visit meta chips — type + duration · fee · status · telehealth (inline wrap, uniform h-6). */}
                    <AppointmentVisitMetaBadgeRow
                      appointmentTypeName={visitMeta.appointmentTypeName}
                      durationMinutes={visitMeta.durationMinutes}
                      visitFeeCents={visitMeta.visitFeeCents}
                      showVisitFeeEstimateHint={visitMeta.showVisitFeeEstimateHint}
                      status={appointment.status}
                      showTelehealthBadge={appointment.is_telehealth ?? false}
                      invoiceDisplayStatus={visitMetaBilling.invoiceDisplayStatus}
                      showInvoiceBadge={visitMetaBilling.showInvoice}
                      paymentStatus={visitMetaBilling.latestPayment?.status}
                      showPaymentBadge={visitMetaBilling.showPayment}
                      billingBadgesLoading={billingBadgesLoading}
                    />
                    <p className="text-sm text-gray-600">
                      <Calendar className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                      {appointment.start
                        ? format(new Date(appointment.start), "PPP · p")
                        : "—"}
                      {appointment.end ? ` – ${format(new Date(appointment.end), "p")}` : ""}
                    </p>
                    {(() => {
                      const place = resolveAppointmentDisplayLocation(appointment);
                      return place ? (
                        <p className="text-sm text-gray-600">
                          <MapPin className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                          {place}
                        </p>
                      ) : null;
                    })()}
                  </div>
                </div>

                <dl className={toneClasses.definitionListClass}>
                  <DefinitionRow icon={Hash} label="Appointment ID" toneClasses={toneClasses}>
                    <EntityIdCopyInline value={appointment.id} />
                  </DefinitionRow>
                  {appointment.chief_complaint ? (
                    <DefinitionRow icon={Stethoscope} label="Chief complaint" toneClasses={toneClasses}>
                      {appointment.chief_complaint}
                    </DefinitionRow>
                  ) : null}
                  {category ? (
                    <DefinitionRow icon={Tags} label="Category" toneClasses={toneClasses}>
                      {categoryHref ? (
                        <CategoryInlineLink
                          categoryId={category.id}
                          label={category.label}
                          color={category.color}
                          icon={category.icon}
                          markSize="compact"
                          linkClassName="text-sm font-medium"
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <CategoryBrandMark
                            color={category.color}
                            icon={category.icon}
                            variant="brand"
                            size="compact"
                          />
                          <span className="font-medium text-sky-700">{category.label}</span>
                        </span>
                      )}
                    </DefinitionRow>
                  ) : null}
                </dl>
              </div>

              <div
                className={cn(
                  entityDetailSnapshotSectionShellClass,
                  tone === "violet" && "border-violet-100/80"
                )}
              >
                <EntityDetailSnapshotSectionHeading
                  icon={Users}
                  sectionIconCircleClass={toneClasses.sectionIconCircleClass}
                  iconClassName={toneClasses.sectionIconClass}
                >
                  {relatedPeopleTitle}
                </EntityDetailSnapshotSectionHeading>
                <dl className={toneClasses.definitionListClass}>
                  {patient ? (
                    <DefinitionRow icon={User} label="Patient" toneClasses={toneClasses} identity>
                      <PatientIdentityCell
                        href={patientDetailHref(entityRole, patient.id)}
                        linkPatient={linkPatientInTitle}
                        name={`${patient.firstname} ${patient.lastname}`.trim()}
                        email={patient.email}
                        layout="inline"
                        careLevel={patient.care_level}
                        patient={{
                          id: patient.id,
                          firstname: patient.firstname,
                          lastname: patient.lastname,
                          email: patient.email ?? "",
                          birth_date: patient.birth_date,
                          clinical_profile: patient.clinical_profile,
                        }}
                      />
                    </DefinitionRow>
                  ) : null}
                  {detail.calendarOwner ? (
                    <DefinitionRow icon={Calendar} label="Calendar owner" toneClasses={toneClasses} identity>
                      <DoctorIdentityCell
                        doctorId={detail.calendarOwner.id}
                        name={clinicianDisplayNameOnly(detail.calendarOwner)}
                        email={detail.calendarOwner.email}
                        image={detail.calendarOwner.image}
                        viewerRole={entityRole}
                        linkKind={ownerLinkKind}
                        staffRole={detail.calendarOwner.role}
                        doctorById={staffById}
                        layout="inline"
                        showRoleBadge
                        showSpecialty={detail.calendarOwner.role === "doctor"}
                      />
                    </DefinitionRow>
                  ) : null}
                  {detail.treatingPhysician &&
                    detail.treatingPhysician.id !== detail.calendarOwner?.id ? (
                    <DefinitionRow icon={Stethoscope} label="Treating physician" toneClasses={toneClasses} identity>
                      <DoctorIdentityCell
                        doctorId={detail.treatingPhysician.id}
                        name={clinicianDisplayNameOnly(detail.treatingPhysician)}
                        email={detail.treatingPhysician.email}
                        image={detail.treatingPhysician.image}
                        specialty={detail.treatingPhysician.specialty}
                        viewerRole={entityRole}
                        linkKind={treatingLinkKind}
                        staffRole={detail.treatingPhysician.role}
                        doctorById={staffById}
                        layout="inline"
                        showRoleBadge
                        showSpecialty
                      />
                    </DefinitionRow>
                  ) : null}
                  {patient?.primary_doctor_id ? (
                    <DefinitionRow icon={Stethoscope} label="Primary doctor" toneClasses={toneClasses} identity>
                      <DoctorIdentityCell
                        doctorId={patient.primary_doctor_id}
                        name={primaryDoctorName}
                        email={patient.primary_doctor_email}
                        image={patient.primary_doctor_image}
                        specialty={patient.primary_doctor_specialty}
                        viewerRole={entityRole}
                        linkKind={treatingLinkKind}
                        staffRole="doctor"
                        doctorById={staffById}
                        layout="inline"
                        showRoleBadge
                        showSpecialty
                      />
                    </DefinitionRow>
                  ) : null}
                </dl>
              </div>

              {(showNotes && appointment.notes) || (appointment.attachments?.length ?? 0) > 0 ? (
                <div className={cn("border-t pt-3", toneClasses.sectionDividerClass)}>
                  <EntityDetailSnapshotSectionHeading
                    icon={FileText}
                    sectionIconCircleClass={toneClasses.sectionIconCircleClass}
                    iconClassName={toneClasses.sectionIconClass}
                  >
                    Clinical
                  </EntityDetailSnapshotSectionHeading>
                  <dl className={cn(toneClasses.definitionListClass, "mt-2")}>
                    {showNotes ? (
                      <DefinitionRow icon={FileText} label="Notes" toneClasses={toneClasses}>
                        {clinicalEmptyOr(appointment.notes, "inline")}
                      </DefinitionRow>
                    ) : null}
                    <DefinitionRow icon={FileText} label="Attachments" toneClasses={toneClasses}>
                      {appointment.attachments?.length
                        ? `${appointment.attachments.length} file(s)`
                        : "—"}
                    </DefinitionRow>
                  </dl>
                </div>
              ) : null}

              <EntityDetailRecordAuditCard
                createdAt={appointment.created_at}
                updatedAt={appointment.updated_at}
                createdBy={detail.auditCreatedBy}
                updatedBy={detail.auditUpdatedBy}
                viewerRole={entityRole}
                extraRows={invoiceAuditExtraRows}
                iconCircleClass={toneClasses.fieldIconCircleClass}
                iconClassName={toneClasses.fieldIconClass}
              />

              {detail.assignees.length > 0 ? (
                <div className={cn(entityDetailSnapshotSectionShellClass, tone === "violet" && "border-violet-100/80")}>
                  <EntityDetailSnapshotSectionHeading
                    icon={Users}
                    sectionIconCircleClass={toneClasses.sectionIconCircleClass}
                    iconClassName={toneClasses.sectionIconClass}
                    count={detail.assignees.length}
                  >
                    Assignees
                  </EntityDetailSnapshotSectionHeading>
                  <ul className="mt-2 space-y-1 text-sm">
                    {detail.assignees.map((a) => (
                      <li
                        key={a.id}
                        className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-1 last:border-0"
                      >
                        <span>{a.displayLabel}</span>
                        <span className="flex gap-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {a.permission ?? "read"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {a.status ?? "pending"}
                          </Badge>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div
                className={cn(
                  entityDetailSnapshotSectionShellClass,
                  tone === "violet" && "border-violet-100/80"
                )}
              >
                <EntityDetailSnapshotSectionHeading
                  icon={Receipt}
                  sectionIconCircleClass={toneClasses.sectionIconCircleClass}
                  iconClassName={toneClasses.sectionIconClass}
                  count={linkedInvoices.length}
                >
                  {relatedBillingTitle}
                </EntityDetailSnapshotSectionHeading>
                <InvoiceClinicalListTable
                  invoices={linkedInvoices}
                  viewerRole={entityRole}
                  isLoading={billingBadgesLoading}
                  emptyMessage="No invoice for this visit"
                  tableFrameClassName="rounded-md border border-slate-200/80 bg-white shadow-none"
                />
              </div>

            </>
          )}
        </CardContent>
      </Card>

      {showLiveBody ? (
        <AppointmentDetailActionBar
          appointment={appointment}
          assignees={assigneesForMenu}
          linkedInvoices={linkedInvoices}
          backHref={backHref}
          backLabel={backListLabel}
          toneClasses={toneClasses}
          canEdit={canEdit}
          listHref={backHref}
          onEditClick={openEditDialog}
        />
      ) : null}

      {canEdit && showLiveBody ? (
        <AppointmentDialogController
          appointment={fullAppointmentForDialog}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      ) : null}
    </EntityDetailPageShell>
  );
}
