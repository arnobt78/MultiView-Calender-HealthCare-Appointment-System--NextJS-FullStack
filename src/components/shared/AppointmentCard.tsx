"use client";

/**
 * Unified dashboard appointment card — List, Month side panel, hover popover, Day/Week blocks.
 *
 * Variants:
 * - list: full meta + right rail (⋮ menu + optional VideoCall)
 * - month-panel: full meta; ⋮ inline in header (no empty action column)
 * - popover: full meta inside fixed-width hover surface
 * - compact / minimal: grid triggers; density from slotHeightPx
 *
 * CRUD must use parent callbacks wired to useAppointmentData mutations so
 * invalidateAfterAppointmentMutation runs (see useAppointments).
 */

import clsx from "clsx";
import type { ReactNode } from "react";
import { AppointmentActionsMenu } from "@/components/shared/AppointmentActionsMenu";
import { AppointmentCardMetaRow } from "@/components/shared/AppointmentCardMetaRow";
import { AppointmentListColorBar } from "@/components/shared/AppointmentListColorBar";
import { AppointmentTitleRow } from "@/components/shared/AppointmentTitleRow";
import { DoctorAvatar } from "@/components/shared/doctor-display/DoctorAvatar";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { PatientAgeGlassBadge } from "@/components/shared/person-display/PatientAgeGlassBadge";
import { PatientCareTierGlassBadge } from "@/components/shared/person-display/PatientCareTierGlassBadge";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import { AppointmentCategoryTypeMetaRow } from "@/components/shared/appointment-display/AppointmentCategoryTypeMetaRow";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { resolveAppointmentDisplayLocation } from "@/lib/appointment-visit-location";
import { resolvePrimaryDoctorCardImage } from "@/lib/appointment-card-clinician-image";
import { canShowAppointmentClinicalNotes } from "@/lib/portal-appointment-card-visibility";
import { shouldShowAppointmentCategoryTypeRow } from "@/lib/appointment-type-display";
import {
  CalendarDays,
  Clock3,
  Flag,
  MapPin,
  NotebookPen,
  Paperclip,
  Share2,
  Stethoscope,
  Tags,
  UserCog,
  UserRound,
  Users,
  Video,
  Receipt,
} from "@/components/shared/appointment-card-icons";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { TruncatedText, WrappingText } from "@/components/shared/TruncatedText";
import type { FullAppointment } from "@/hooks/useAppointments";
import {
  useAppointmentCardModel,
  type AppointmentCardAudience,
  type UseAppointmentCardModelParams,
} from "@/hooks/useAppointmentCardModel";
import type { OwnerUserSummary } from "@/hooks/useOwnerUserSummaries";
import { appointmentCardMetaGroupClass, type AppointmentCardVariant } from "@/lib/appointment-card";
import { PortalClinicianLink } from "@/components/shared/PortalClinicianLink";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { getPublicUrl } from "@/lib/vercelBlob";
import { patientAgeYears } from "@/lib/patient-age";
import type { AppointmentAssignee, Patient } from "@/types/types";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import { useInvoiceFormDialogOptional } from "@/context/InvoiceFormDialogContext";
import { useAuth } from "@/hooks/useAuth";
import { canShowCreateInvoiceAction } from "@/lib/appointment-invoice-create-eligibility";
import { resolveDisplayedVisitFeeCents } from "@/lib/appointment-visit-fee-display";

export type AppointmentCardProps = {
  appointment: FullAppointment;
  patients: Patient[];
  assignees: AppointmentAssignee[];
  ownerUsers: OwnerUserSummary[];
  variant: AppointmentCardVariant;
  slotHeightPx?: number;
  className?: string;
  onEdit: (appt: FullAppointment) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, nextStatus: "pending" | "done" | "alert") => void;
  /** List rail only — telehealth VideoCall below ⋮ menu */
  telehealthSlot?: ReactNode;
  /** Dashboard calendar vs patient portal timeline — portal shows staff rows for patients. */
  audience?: AppointmentCardAudience;
  /** Patient portal: hide right ⋮ rail (read-only history). */
  hideActionsRail?: boolean;
  /** Portal API labels — avoids `/api/users/search` for patients. */
  portalOwnerLabel?: string;
  portalTreatingLabel?: string;
  /** Latest linked invoice display status (from invoices cache). */
  invoiceDisplayStatus?: InvoiceDisplayStatus | null;
  /** Visit fee in cents from the appointment type — shown as price badge on the card. */
  appointmentTypePriceCents?: number | null;
  /** Treating physician (or owner) consultation_fee — second fallback in resolveDisplayedVisitFeeCents. */
  doctorConsultationFeeCents?: number | null;
  /** When set, card is a hover/grid trigger only (no outer chrome) */
  /** Inside `AppointmentHoverCard` — no role=button so Radix hover pointer events work. */
  asHoverTrigger?: boolean;
  asTrigger?: boolean;
  triggerClassName?: string;
  onTriggerClick?: (e: React.MouseEvent) => void;
};

type MetaIdentityBlockProps = {
  icon: ReactNode;
  label: string;
  nameNode: ReactNode;
  nameFallback: string;
  email?: string | null;
  /** Doctor specialty pill below name/email (popover + month-panel). */
  specialty?: string | null;
  /** Optional second line under name/email — client age + care tier badges. */
  badgeRow?: ReactNode;
  avatarNode?: ReactNode;
};

type InlineIdentityValueProps = {
  avatarNode?: ReactNode;
  nameNode: ReactNode;
  nameFallback: string;
  email?: string | null;
  /** Inline after email on list rows — patient age + care tier. */
  demographicBadges?: ReactNode;
  specialty?: string | null;
};

type InlineIdentityMetaRowProps = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
};

type PatientDemographicBadgesRowProps = {
  age: number | null;
  careLevel: number | null | undefined;
  compact?: boolean;
};

function formatBracketEmail(email?: string | null): string | null {
  const trimmed = email?.trim();
  if (!trimmed) return null;
  return `(${trimmed})`;
}

/** List-view identity row: icon + label + value on one baseline (wraps on narrow widths). */
function InlineIdentityMetaRow({ icon, label, children }: InlineIdentityMetaRowProps) {
  return (
    <div className="flex min-w-0 w-full flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-gray-600">
      <span className="inline-flex shrink-0 items-center text-gray-400">{icon}</span>
      <span className="shrink-0 text-gray-400">{label}</span>
      {children}
    </div>
  );
}

/** Reusable patient profile badges (age + care tier) used by list/popover/month variants. */
function PatientDemographicBadgesRow({
  age,
  careLevel,
  compact = false,
}: PatientDemographicBadgesRowProps) {
  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-1.5">
      {age != null ? <PatientAgeGlassBadge age={age} compact={compact} /> : null}
      <PatientCareTierGlassBadge careLevel={careLevel} compact={compact} />
    </span>
  );
}

/**
 * Popover / month-panel identity row (label + avatar + name/email) kept outside render scope
 * so eslint static-components rule passes and row state remains stable.
 */
/** Popover / month-panel — one responsive row: label + avatar + name + email + badges. */
function MetaIdentityBlock({
  icon,
  label,
  nameNode,
  nameFallback,
  email,
  specialty,
  badgeRow,
  avatarNode,
}: MetaIdentityBlockProps) {
  const bracketEmail = formatBracketEmail(email);
  return (
    <AppointmentCardMetaRow
      icon={icon}
      label={`${label}:`}
      wrap
      className="flex w-full min-w-0 items-center"
    >
      <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        {avatarNode ?? (
          <UserAvatar
            src={null}
            alt={nameFallback}
            fallbackText={nameFallback}
            sizeClassName="h-7 w-7"
            className="shrink-0"
          />
        )}
        <span className="min-w-0 text-xs font-medium text-gray-700">{nameNode}</span>
        <span className="min-w-0 truncate text-xs text-gray-500">{bracketEmail || "(—)"}</span>
        {badgeRow}
        {specialty?.trim() ? (
          <DoctorSpecialtyBadge specialty={specialty} className="shrink-0" />
        ) : null}
      </span>
    </AppointmentCardMetaRow>
  );
}

/**
 * List-row identity value (avatar + name + email) that wraps inline on narrow widths.
 * Keeps one reusable rendering path for client/owner/treating/primary rows.
 */
function InlineIdentityValue({
  avatarNode,
  nameNode,
  nameFallback,
  email,
  demographicBadges,
  specialty,
}: InlineIdentityValueProps) {
  const bracketEmail = formatBracketEmail(email);
  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
      {avatarNode ?? (
        <UserAvatar
          src={null}
          alt={nameFallback}
          fallbackText={nameFallback}
          sizeClassName="h-6 w-6"
          className="shrink-0"
        />
      )}
      <span className="min-w-0 text-xs font-medium text-gray-700">{nameNode}</span>
      <span className="min-w-0 truncate text-xs text-gray-500">{bracketEmail || "(—)"}</span>
      {demographicBadges}
      {specialty?.trim() ? (
        <DoctorSpecialtyBadge specialty={specialty} className="self-center" />
      ) : null}
    </span>
  );
}

function AppointmentCardMeta({
  appointment,
  model,
  wrapValues,
  variant,
  ownerUsers,
  invoiceDisplayStatus,
  appointmentTypePriceCents,
  doctorConsultationFeeCents,
}: {
  appointment: FullAppointment;
  model: ReturnType<typeof useAppointmentCardModel>;
  wrapValues: boolean;
  variant: AppointmentCardVariant;
  ownerUsers: OwnerUserSummary[];
  invoiceDisplayStatus?: InvoiceDisplayStatus | null;
  appointmentTypePriceCents?: number | null;
  doctorConsultationFeeCents?: number | null;
}) {
  const {
    isDone,
    formattedDate,
    formattedTime,
    statusClass,
    patientLabel,
    patientId,
    ownerLabel,
    dedupedAssignees,
    calendarOwnerId,
    treatingPhysicianId,
    treatingDiffersFromOwner,
    treatingPhysicianLabel,
    primaryDoctorId,
    primaryDoctorLabel,
    referralLabel,
    user,
    audience,
    portalOwner,
    portalTreating,
  } = model;
  /** Embedded staff from portal-shaped API — patient dashboard + portal (no `/api/users/search`). */
  const showEmbeddedClinician = Boolean(portalOwner);
  const isPatientViewer = user?.role === "patient";
  const showClinicianForDashboard = !isPatientViewer;
  const useInlinePeopleRows = variant === "list";
  const useStructuredPeopleRows =
    variant === "popover" || variant === "month-panel";
  const TextWrap = wrapValues ? WrappingText : TruncatedText;
  const ownerSummary = ownerUsers.find((row) => row.id === calendarOwnerId);
  const treatingSummary = ownerUsers.find((row) => row.id === treatingPhysicianId);
  const primarySummary = primaryDoctorId
    ? ownerUsers.find((row) => row.id === primaryDoctorId)
    : undefined;

  const patientName = patientLabel?.trim() || "--";
  const patientEmail = appointment.patient_data?.email?.trim() || null;

  const ownerName =
    portalOwner?.display_name?.trim() ||
    ownerSummary?.display_name?.trim() ||
    ownerLabel?.split("(")?.[0]?.trim() ||
    ownerSummary?.email?.trim() ||
    portalOwner?.email?.trim() ||
    "--";
  const ownerEmail =
    portalOwner?.email?.trim() ||
    ownerSummary?.email?.trim() ||
    (ownerLabel.includes("@") ? ownerLabel.replace(/^.*\((.*)\).*$/, "$1").trim() : null);

  const treatingName =
    portalTreating?.display_name?.trim() ||
    treatingSummary?.display_name?.trim() ||
    treatingPhysicianLabel?.split("(")?.[0]?.trim() ||
    portalTreating?.email?.trim() ||
    treatingSummary?.email?.trim() ||
    "--";
  const treatingEmail =
    portalTreating?.email?.trim() ||
    treatingSummary?.email?.trim() ||
    (treatingPhysicianLabel.includes("@")
      ? treatingPhysicianLabel.replace(/^.*\((.*)\).*$/, "$1").trim()
      : null);

  const primaryName =
    appointment.patient_data?.primary_doctor_display?.trim() ||
    primarySummary?.display_name?.trim() ||
    primaryDoctorLabel?.split("(")?.[0]?.trim() ||
    appointment.patient_data?.primary_doctor_email?.trim() ||
    primarySummary?.email?.trim() ||
    "--";
  const primaryEmail =
    appointment.patient_data?.primary_doctor_email?.trim() ||
    primarySummary?.email?.trim() ||
    (primaryDoctorLabel?.includes("@")
      ? primaryDoctorLabel.replace(/^.*\((.*)\).*$/, "$1").trim()
      : null);
  const ownerSpecialty =
    portalOwner?.specialty?.trim() || ownerSummary?.specialty?.trim() || null;
  const treatingSpecialty =
    portalTreating?.specialty?.trim() || treatingSummary?.specialty?.trim() || null;
  const primarySpecialty =
    appointment.patient_data?.primary_doctor_specialty?.trim() ||
    primarySummary?.specialty?.trim() ||
    null;
  const patientAge = patientAgeYears(appointment.patient_data?.birth_date ?? null);
  const patientCareLevel = appointment.patient_data?.care_level ?? null;
  const displayFeeCents = resolveDisplayedVisitFeeCents({
    typePriceCents: appointmentTypePriceCents,
    doctorConsultationFeeCents,
  });
  const showClinicalNotes = canShowAppointmentClinicalNotes(user?.role ?? null);
  const primaryDoctorImage = primaryDoctorId
    ? resolvePrimaryDoctorCardImage(
        {
          patient_data: appointment.patient_data,
          calendarOwnerId,
          treatingPhysicianId,
          portal_owner: appointment.portal_owner,
          portal_treating_physician: appointment.portal_treating_physician,
        },
        primaryDoctorId,
        ownerUsers
      )
    : null;
  const showCategoryTypeRow =
    Boolean(appointment.category_data) ||
    shouldShowAppointmentCategoryTypeRow(appointment, displayFeeCents);
  const displayLocation = resolveAppointmentDisplayLocation(appointment);

  return (
    <>
      <div className={appointmentCardMetaGroupClass}>
        <AppointmentCardMetaRow icon={<CalendarDays className="h-3.5 w-3.5" />}>
          <span className={clsx(isDone && "line-through text-gray-400")}>{formattedDate}</span>
        </AppointmentCardMetaRow>
        <AppointmentCardMetaRow icon={<Clock3 className="h-3.5 w-3.5" />}>
          <span className={clsx(isDone && "line-through text-gray-400")}>{formattedTime}</span>
        </AppointmentCardMetaRow>
        {!appointment.is_telehealth ? (
          <AppointmentCardMetaRow icon={<MapPin className="h-3.5 w-3.5" />} wrap={wrapValues}>
            {wrapValues ? (
              <WrappingText className={isDone ? "text-gray-400" : "text-gray-700"}>
                {displayLocation || "--"}
              </WrappingText>
            ) : (
              <span className={clsx("truncate text-gray-700", isDone && "text-gray-400")}>
                {displayLocation || "--"}
              </span>
            )}
          </AppointmentCardMetaRow>
        ) : null}
      </div>

      <div className={clsx(appointmentCardMetaGroupClass, "text-gray-700")}>
        {useStructuredPeopleRows ? (
          <MetaIdentityBlock
            icon={<UserRound className="h-3.5 w-3.5" />}
            label="Client"
            nameNode={
              patientId ? (
                <RoleEntityLink
                  kind="patient"
                  id={patientId}
                  label={patientName}
                  wrapLabel={false}
                  className="text-xs font-medium"
                />
              ) : (
                <span className="text-xs font-medium text-gray-700">{patientName}</span>
              )
            }
            nameFallback={patientName}
            email={patientEmail}
            badgeRow={
              <PatientDemographicBadgesRow
                age={patientAge}
                careLevel={patientCareLevel}
                compact
              />
            }
            avatarNode={
              appointment.patient_data ? (
                <PatientPortraitAvatar
                  patient={appointment.patient_data}
                  sizeClassName="h-7 w-7"
                  className="shrink-0"
                />
              ) : undefined
            }
          />
        ) : useInlinePeopleRows ? (
          <InlineIdentityMetaRow icon={<UserRound className="h-3.5 w-3.5" />} label="Client:">
            <InlineIdentityValue
              nameNode={
                patientId ? (
                  <RoleEntityLink
                    kind="patient"
                    id={patientId}
                    label={patientName}
                    wrapLabel={false}
                    className="text-xs font-medium"
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-700">{patientName}</span>
                )
              }
              nameFallback={patientName}
              email={patientEmail}
              demographicBadges={
                <PatientDemographicBadgesRow
                  age={patientAge}
                  careLevel={patientCareLevel}
                  compact
                />
              }
              avatarNode={
                appointment.patient_data ? (
                  <PatientPortraitAvatar
                    patient={appointment.patient_data}
                    sizeClassName="h-6 w-6"
                    className="shrink-0"
                  />
                ) : undefined
              }
            />
          </InlineIdentityMetaRow>
        ) : (
          <AppointmentCardMetaRow icon={<UserRound className="h-3.5 w-3.5" />} label="Client:">
            {patientId ? (
              <RoleEntityLink
                kind="patient"
                id={patientId}
                label={patientLabel}
                wrapLabel={wrapValues}
                className="text-xs font-medium"
              />
            ) : (
              <span className="text-xs font-medium text-gray-700">{patientLabel}</span>
            )}
          </AppointmentCardMetaRow>
        )}
      </div>

      <div className={clsx(appointmentCardMetaGroupClass, "text-gray-700")}>
        {showCategoryTypeRow ? (
          <AppointmentCategoryTypeMetaRow
            category={
              appointment.category_data
                ? {
                    categoryId: appointment.category_data.id,
                    label: appointment.category_data.label,
                    color: appointment.category_data.color,
                    icon: appointment.category_data.icon,
                    wrapLabel: useInlinePeopleRows || wrapValues,
                  }
                : null
            }
            appointment={appointment}
            displayFeeCents={displayFeeCents}
            showFeeEstimateHint={!invoiceDisplayStatus}
            timeRangeLabel={useInlinePeopleRows ? formattedTime : null}
            wrap={useInlinePeopleRows || wrapValues}
          />
        ) : null}

        <AppointmentCardMetaRow icon={<Flag className="h-3.5 w-3.5" />} label="Status:">
          <span className={clsx("text-xs font-semibold capitalize", statusClass)}>
            {appointment.status || "pending"}
          </span>
        </AppointmentCardMetaRow>

        {invoiceDisplayStatus ? (
          <AppointmentCardMetaRow icon={<Receipt className="h-3.5 w-3.5" />} label="Invoice:">
            <InvoiceStatusBadge displayStatus={invoiceDisplayStatus} />
          </AppointmentCardMetaRow>
        ) : null}

        {appointment.is_telehealth ? <TelehealthSessionBadge /> : null}
      </div>

      {showEmbeddedClinician && calendarOwnerId && portalOwner ? (
        useStructuredPeopleRows ? (
          <MetaIdentityBlock
            icon={<UserCog className="h-3.5 w-3.5" />}
            label="Calendar owner"
            nameNode={
              <PortalClinicianLink
                clinicianUserId={portalOwner.id}
                clinicianRole={portalOwner.role}
                label={ownerName}
                wrapLabel={false}
              />
            }
            nameFallback={ownerName}
            email={ownerEmail}
            specialty={ownerSpecialty}
            avatarNode={
              <DoctorAvatar
                doctor={{
                  id: portalOwner.id,
                  display_name: portalOwner.display_name,
                  email: portalOwner.email,
                  image: portalOwner.image ?? ownerSummary?.image ?? null,
                }}
                sizeClassName="h-7 w-7"
              />
            }
          />
        ) : useInlinePeopleRows ? (
          <InlineIdentityMetaRow icon={<UserCog className="h-3.5 w-3.5" />} label="Calendar owner/creator:">
            <InlineIdentityValue
              nameNode={
                <PortalClinicianLink
                  clinicianUserId={portalOwner.id}
                  clinicianRole={portalOwner.role}
                  label={ownerName}
                  wrapLabel={false}
                />
              }
              nameFallback={ownerName}
              email={ownerEmail}
              specialty={ownerSpecialty}
              avatarNode={
                <DoctorAvatar
                  doctor={{
                    id: portalOwner.id,
                    display_name: portalOwner.display_name,
                    email: portalOwner.email,
                    image: portalOwner.image ?? ownerSummary?.image ?? null,
                  }}
                  sizeClassName="h-6 w-6"
                />
              }
            />
          </InlineIdentityMetaRow>
        ) : (
          <AppointmentCardMetaRow icon={<UserCog className="h-3.5 w-3.5" />} label="Calendar owner:">
            <PortalClinicianLink
              clinicianUserId={portalOwner.id}
              clinicianRole={portalOwner.role}
              label={ownerLabel}
              wrapLabel={wrapValues}
            />
          </AppointmentCardMetaRow>
        )
      ) : null}

      {showEmbeddedClinician && treatingDiffersFromOwner && portalTreating ? (
        useStructuredPeopleRows ? (
          <MetaIdentityBlock
            icon={<Stethoscope className="h-3.5 w-3.5" />}
            label="Treating physician"
            nameNode={
              <PortalClinicianLink
                clinicianUserId={portalTreating.id}
                clinicianRole={portalTreating.role}
                label={treatingName}
                wrapLabel={false}
              />
            }
            nameFallback={treatingName}
            email={treatingEmail}
            specialty={treatingSpecialty}
            avatarNode={
              <DoctorAvatar
                doctor={{
                  id: portalTreating.id,
                  display_name: portalTreating.display_name,
                  email: portalTreating.email,
                  image: portalTreating.image ?? treatingSummary?.image ?? null,
                }}
                sizeClassName="h-7 w-7"
              />
            }
          />
        ) : useInlinePeopleRows ? (
          <InlineIdentityMetaRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Treating physician:">
            <InlineIdentityValue
              nameNode={
                <PortalClinicianLink
                  clinicianUserId={portalTreating.id}
                  clinicianRole={portalTreating.role}
                  label={treatingName}
                  wrapLabel={false}
                />
              }
              nameFallback={treatingName}
              email={treatingEmail}
              specialty={treatingSpecialty}
              avatarNode={
                <DoctorAvatar
                  doctor={{
                    id: portalTreating.id,
                    display_name: portalTreating.display_name,
                    email: portalTreating.email,
                    image: portalTreating.image ?? treatingSummary?.image ?? null,
                  }}
                  sizeClassName="h-6 w-6"
                />
              }
            />
          </InlineIdentityMetaRow>
        ) : (
          <AppointmentCardMetaRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Treating physician:">
            <PortalClinicianLink
              clinicianUserId={portalTreating.id}
              clinicianRole={portalTreating.role}
              label={treatingPhysicianLabel}
              wrapLabel={wrapValues}
            />
          </AppointmentCardMetaRow>
        )
      ) : null}

      {showClinicianForDashboard && calendarOwnerId ? (
        useStructuredPeopleRows ? (
          <MetaIdentityBlock
            icon={<UserCog className="h-3.5 w-3.5" />}
            label="Calendar owner"
            nameNode={
              <RoleEntityLink
                kind="doctor"
                id={calendarOwnerId}
                label={ownerName}
                wrapLabel={false}
                className="text-xs font-medium"
              />
            }
            nameFallback={ownerName}
            email={ownerEmail}
            specialty={ownerSpecialty}
            avatarNode={
              <DoctorAvatar
                doctor={{
                  id: calendarOwnerId,
                  display_name: ownerSummary?.display_name ?? null,
                  email: ownerEmail ?? undefined,
                  image: ownerSummary?.image ?? null,
                }}
                sizeClassName="h-7 w-7"
              />
            }
          />
        ) : useInlinePeopleRows ? (
          <InlineIdentityMetaRow icon={<UserCog className="h-3.5 w-3.5" />} label="Calendar owner/creator:">
            <InlineIdentityValue
              nameNode={
                <RoleEntityLink
                  kind="doctor"
                  id={calendarOwnerId}
                  label={ownerName}
                  wrapLabel={false}
                  className="text-xs font-medium"
                />
              }
              nameFallback={ownerName}
              email={ownerEmail}
              specialty={ownerSpecialty}
              avatarNode={
                <DoctorAvatar
                  doctor={{
                    id: calendarOwnerId,
                    display_name: ownerSummary?.display_name ?? null,
                    email: ownerEmail ?? undefined,
                    image: ownerSummary?.image ?? null,
                  }}
                  sizeClassName="h-6 w-6"
                />
              }
            />
          </InlineIdentityMetaRow>
        ) : (
          <AppointmentCardMetaRow icon={<UserCog className="h-3.5 w-3.5" />} label="Calendar owner:">
            <RoleEntityLink kind="doctor" id={calendarOwnerId} label={ownerLabel} wrapLabel={wrapValues} className="text-xs font-medium" />
          </AppointmentCardMetaRow>
        )
      ) : null}

      {showClinicianForDashboard && treatingDiffersFromOwner ? (
        useStructuredPeopleRows ? (
          <MetaIdentityBlock
            icon={<Stethoscope className="h-3.5 w-3.5" />}
            label="Treating physician"
            nameNode={
              <RoleEntityLink
                kind="doctor"
                id={treatingPhysicianId}
                label={treatingName}
                wrapLabel={false}
                className="text-xs font-medium"
              />
            }
            nameFallback={treatingName}
            email={treatingEmail}
            specialty={treatingSpecialty}
            avatarNode={
              <DoctorAvatar
                doctor={{
                  id: treatingPhysicianId,
                  display_name: treatingSummary?.display_name ?? null,
                  email: treatingEmail ?? undefined,
                  image: treatingSummary?.image ?? null,
                }}
                sizeClassName="h-7 w-7"
              />
            }
          />
        ) : useInlinePeopleRows ? (
          <InlineIdentityMetaRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Treating physician:">
            <InlineIdentityValue
              nameNode={
                <RoleEntityLink
                  kind="doctor"
                  id={treatingPhysicianId}
                  label={treatingName}
                  wrapLabel={false}
                  className="text-xs font-medium"
                />
              }
              nameFallback={treatingName}
              email={treatingEmail}
              specialty={treatingSpecialty}
              avatarNode={
                <DoctorAvatar
                  doctor={{
                    id: treatingPhysicianId,
                    display_name: treatingSummary?.display_name ?? null,
                    email: treatingEmail ?? undefined,
                    image: treatingSummary?.image ?? null,
                  }}
                  sizeClassName="h-6 w-6"
                />
              }
            />
          </InlineIdentityMetaRow>
        ) : (
          <AppointmentCardMetaRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Treating physician:">
            <RoleEntityLink
              kind="doctor"
              id={treatingPhysicianId}
              label={treatingPhysicianLabel}
              wrapLabel={wrapValues}
              className="text-xs font-medium"
            />
          </AppointmentCardMetaRow>
        )
      ) : null}

      {primaryDoctorId && primaryDoctorLabel ? (
        useStructuredPeopleRows ? (
          <MetaIdentityBlock
            icon={<Stethoscope className="h-3.5 w-3.5" />}
            label="Primary doctor"
            nameNode={
              isPatientViewer ? (
                <PortalClinicianLink
                  clinicianUserId={primaryDoctorId}
                  clinicianRole="doctor"
                  label={primaryName}
                  wrapLabel={false}
                />
              ) : (
                <RoleEntityLink
                  kind="doctor"
                  id={primaryDoctorId}
                  label={primaryName}
                  wrapLabel={false}
                  className="text-xs font-medium"
                />
              )
            }
            nameFallback={primaryName}
            email={primaryEmail}
            specialty={primarySpecialty}
            avatarNode={
              <DoctorAvatar
                doctor={{
                  id: primaryDoctorId,
                  display_name:
                    appointment.patient_data?.primary_doctor_display ??
                    primarySummary?.display_name ??
                    null,
                  email: primaryEmail ?? undefined,
                  image: primaryDoctorImage,
                }}
                sizeClassName="h-7 w-7"
              />
            }
          />
        ) : useInlinePeopleRows ? (
          <InlineIdentityMetaRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Primary doctor:">
            <InlineIdentityValue
              nameNode={
                isPatientViewer ? (
                  <PortalClinicianLink
                    clinicianUserId={primaryDoctorId}
                    clinicianRole="doctor"
                    label={primaryName}
                    wrapLabel={false}
                  />
                ) : (
                  <RoleEntityLink
                    kind="doctor"
                    id={primaryDoctorId}
                    label={primaryName}
                    wrapLabel={false}
                    className="text-xs font-medium"
                  />
                )
              }
              nameFallback={primaryName}
              email={primaryEmail}
              specialty={primarySpecialty}
              avatarNode={
                <DoctorAvatar
                  doctor={{
                    id: primaryDoctorId,
                    display_name:
                      appointment.patient_data?.primary_doctor_display ??
                      primarySummary?.display_name ??
                      null,
                    email: primaryEmail ?? undefined,
                    image: primaryDoctorImage,
                  }}
                  sizeClassName="h-6 w-6"
                />
              }
            />
          </InlineIdentityMetaRow>
        ) : (
          <AppointmentCardMetaRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Primary doctor:">
            {isPatientViewer ? (
              <PortalClinicianLink
                clinicianUserId={primaryDoctorId}
                clinicianRole="doctor"
                label={primaryDoctorLabel}
                wrapLabel={wrapValues}
              />
            ) : (
              <RoleEntityLink
                kind="doctor"
                id={primaryDoctorId}
                label={primaryDoctorLabel}
                wrapLabel={wrapValues}
                className="text-xs font-medium"
              />
            )}
          </AppointmentCardMetaRow>
        )
      ) : null}

      {referralLabel ? (
        <AppointmentCardMetaRow icon={<Share2 className="h-3.5 w-3.5" />} label="Referral:" wrap={wrapValues}>
          <TextWrap className={isDone ? "text-gray-400" : "text-gray-700"}>{referralLabel}</TextWrap>
        </AppointmentCardMetaRow>
      ) : null}

      {appointment.chief_complaint ? (
        <AppointmentCardMetaRow icon={<NotebookPen className="h-3.5 w-3.5" />} label="Chief complaint:" wrap={wrapValues}>
          <TextWrap className={isDone ? "text-gray-400" : "text-gray-600"}>{appointment.chief_complaint}</TextWrap>
        </AppointmentCardMetaRow>
      ) : null}

      {appointment.telehealth_link ? (
        <AppointmentCardMetaRow icon={<Video className="h-3.5 w-3.5" />} label="Join call:">
          <a
            href={appointment.telehealth_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-sky-700 underline"
          >
            Open telehealth
          </a>
        </AppointmentCardMetaRow>
      ) : null}

      {showClinicalNotes && appointment.notes ? (
        <AppointmentCardMetaRow icon={<NotebookPen className="h-3.5 w-3.5" />} label="Note:" wrap={wrapValues}>
          <TextWrap className={isDone ? "text-gray-400" : "text-gray-600"} title={appointment.notes}>
            {appointment.notes}
          </TextWrap>
        </AppointmentCardMetaRow>
      ) : null}

      {appointment.attachments && appointment.attachments.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
          <Paperclip className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="shrink-0 text-gray-400">Attachments:</span>
          {appointment.attachments.map((file, idx) => {
            const publicUrl = getPublicUrl(file);
            const fileName = file.split("/").pop() || file;
            return publicUrl ? (
              <a
                key={idx}
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {fileName}
              </a>
            ) : (
              <span key={idx} className="text-red-500">
                [File not found]
              </span>
            );
          })}
        </div>
      ) : null}

      {dedupedAssignees.length > 0 ? (
        <AppointmentCardMetaRow icon={<Users className="h-3.5 w-3.5" />} label="Assigned by:">
          <span
            className={clsx(
              "text-xs font-medium",
              appointment.user_id === model.user?.id ? "text-green-700" : "text-blue-700"
            )}
          >
            {ownerLabel}
          </span>
        </AppointmentCardMetaRow>
      ) : null}
    </>
  );
}

export function AppointmentCard({
  appointment,
  patients,
  assignees,
  ownerUsers,
  variant,
  slotHeightPx,
  className,
  onEdit,
  onDelete,
  onToggleStatus,
  telehealthSlot,
  audience = "dashboard",
  hideActionsRail = false,
  portalOwnerLabel,
  portalTreatingLabel,
  invoiceDisplayStatus,
  appointmentTypePriceCents,
  doctorConsultationFeeCents,
  asHoverTrigger,
  asTrigger,
  triggerClassName,
  onTriggerClick,
}: AppointmentCardProps) {
  const { user: authUser } = useAuth();
  const invoiceDialog = useInvoiceFormDialogOptional();
  const showCreateInvoice = canShowCreateInvoiceAction({
    role: authUser?.role,
    invoiceDisplayStatus,
  });
  const handleCreateInvoice =
    invoiceDialog && showCreateInvoice
      ? (id: string) => invoiceDialog.openCreateForAppointment(id)
      : undefined;

  const model = useAppointmentCardModel({
    appointment,
    patients,
    assignees,
    ownerUsers,
    variant,
    slotHeightPx,
    audience,
    portalOwnerLabel,
    portalTreatingLabel,
  } as UseAppointmentCardModelParams);

  const { density, colorToken, isDone, start, user } = model;
  const wrapValues =
    density === "full" && (variant === "month-panel" || variant === "popover");
  /** List keeps single-line title; month panel + popover wrap with break-words. */
  const wrapTitle =
    density === "full" && (variant === "month-panel" || variant === "popover");
  const truncateTitle = !wrapTitle && density !== "minimal";

  const menu = (
    <AppointmentActionsMenu
      appointment={appointment}
      userId={authUser?.id}
      userEmail={authUser?.email}
      userRole={authUser?.role}
      onToggleStatus={onToggleStatus}
      onEdit={() => onEdit(appointment)}
      onDelete={onDelete}
      onCreateInvoice={handleCreateInvoice}
      showCreateInvoice={Boolean(handleCreateInvoice)}
      triggerClassName="h-8 w-8 rounded-full hover:bg-black/10"
      // Popover: dropdown must render above HoverCardContent z-[60]:
      contentClassName={variant === "popover" ? "w-56 z-[80]" : undefined}
    />
  );

  const titleRow = (
    <AppointmentTitleRow
      appointmentId={appointment.id}
      title={appointment.title ?? ""}
      appointmentStart={start}
      isDone={isDone}
      wrapTitle={wrapTitle}
      titleLayout={variant === "month-panel" ? "stacked" : "inline"}
      className={truncateTitle ? "min-w-0" : "w-full"}
    />
  );

  const headerRow =
    variant === "month-panel" || variant === "popover" ? (
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="min-w-0 flex-1">{titleRow}</div>
        <div className="shrink-0">{menu}</div>
      </div>
    ) : (
      titleRow
    );

  const compactLocation = resolveAppointmentDisplayLocation(appointment);

  const compactMeta =
    density === "compact" ? (
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-[10px] text-gray-500">
        <span className="truncate">{model.formattedDate}</span>
        <span className="truncate">{model.formattedTime}</span>
        {compactLocation ? <span className="truncate">{compactLocation}</span> : null}
        <span className="truncate">{model.patientLabel}</span>
        {appointment.is_telehealth ? <TelehealthSessionBadge className="scale-90" /> : null}
      </div>
    ) : null;

  const body =
    density === "full" ? (
      <AppointmentCardMeta
        appointment={appointment}
        model={model}
        wrapValues={wrapValues}
        variant={variant}
        ownerUsers={ownerUsers}
        invoiceDisplayStatus={invoiceDisplayStatus}
        appointmentTypePriceCents={appointmentTypePriceCents}
        doctorConsultationFeeCents={doctorConsultationFeeCents}
      />
    ) : (
      compactMeta
    );

  const inner = (
    <>
      {headerRow}
      {body}
    </>
  );

  if (asTrigger) {
    const isMinimal = density === "minimal";
    return (
      <div
        role={asHoverTrigger ? undefined : "button"}
        tabIndex={asHoverTrigger ? undefined : 0}
        className={clsx(
          "relative z-10 flex min-w-0 overflow-hidden rounded-2xl border shadow-xl transition",
          // Hover trigger: cursor-default on outer shell — links inside handle their own pointer cursors.
          // Non-hover trigger (asTrigger only): cursor-pointer + brightness on hover.
          asHoverTrigger ? "cursor-default" : "cursor-pointer hover:brightness-110",
          isMinimal ? "hover-card-simple items-center" : "hover-card-rich h-full w-full flex-col",
          isDone && "opacity-60",
          triggerClassName
        )}
        onClick={onTriggerClick}
        onKeyDown={
          asHoverTrigger
            ? undefined
            : (e) => {
                if (e.key === "Enter" || e.key === " ") onTriggerClick?.(e as unknown as React.MouseEvent);
              }
        }
        style={{
          backgroundColor: colorToken.cardSurfaceColor,
          borderColor: colorToken.cardBorderColor,
        }}
      >
        {!isMinimal ? (
          <svg
            className="absolute left-0 top-0 bottom-0 h-full w-2 rounded-l-2xl"
            aria-hidden
            preserveAspectRatio="none"
            viewBox="0 0 8 100"
          >
            <rect width="8" height="100" fill={colorToken.lineColor} />
          </svg>
        ) : (
          <svg width="8" height="24" viewBox="0 0 8 24" aria-hidden className="mr-2 shrink-0 rounded-l-2xl">
            <rect width="8" height="24" fill={colorToken.lineColor} />
          </svg>
        )}
        <div className={clsx("hover-card-content-inner min-w-0", isMinimal ? "flex-1 truncate px-0" : "px-2 py-1.5 pl-3")}>
          {isMinimal ? (
            <RoleEntityLink
              kind="appointment"
              id={appointment.id}
              label={appointment.title ?? ""}
              className={clsx(
                "block min-w-0 truncate text-sm font-normal",
                isDone && "line-through text-gray-400"
              )}
            />
          ) : (
            inner
          )}
        </div>
      </div>
    );
  }

  if (variant === "popover") {
    return (
      // No padding on outer container — SVG bar sits at true left-0 of HoverCardContent (which is p-0):
      <div className={clsx("relative min-w-0", className)}>
        <svg
          className="absolute left-0 top-0 bottom-0 h-full w-1.5 rounded-l-2xl"
          aria-hidden
          preserveAspectRatio="none"
          viewBox="0 0 6 100"
        >
          <rect width="6" height="100" fill={colorToken.lineColor} />
        </svg>
        <div className="py-4 pr-4 pl-5">{inner}</div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "relative flex items-stretch rounded-2xl border shadow-md transition hover:shadow-xl",
        variant === "list" ? "min-h-[130px]" : "min-h-[110px]",
        isDone && "bg-gray-100/80 opacity-60",
        className
      )}
      style={{
        backgroundColor: colorToken.cardBgColor,
        borderColor: colorToken.cardBorderColor,
      }}
    >
      <AppointmentListColorBar color={colorToken.lineColor} />
      <div
        className={clsx(
          "flex min-w-0 flex-1 flex-col justify-center gap-1 py-3 pl-6",
          hideActionsRail ? "pr-4" : "pr-4"
        )}
      >
        {inner}
      </div>
      {variant === "list" && !hideActionsRail ? (
        <div className="flex min-w-[56px] flex-col items-center justify-between rounded-r-2xl border-l border-gray-100 bg-gray-50/80 px-2 py-3">
          {menu}
          {telehealthSlot}
        </div>
      ) : null}
    </div>
  );
}
