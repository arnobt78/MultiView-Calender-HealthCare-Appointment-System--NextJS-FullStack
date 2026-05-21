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
import { CategoryInlineLink } from "@/components/shared/CategoryInlineLink";
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
import { PortalStaffLink } from "@/components/shared/PortalStaffLink";
import { getPublicUrl } from "@/lib/vercelBlob";
import type { AppointmentAssignee, Patient } from "@/types/types";

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
  /** When set, card is a hover/grid trigger only (no outer chrome) */
  /** Inside `AppointmentHoverCard` — no role=button so Radix hover pointer events work. */
  asHoverTrigger?: boolean;
  asTrigger?: boolean;
  triggerClassName?: string;
  onTriggerClick?: (e: React.MouseEvent) => void;
};

function AppointmentCardMeta({
  appointment,
  model,
  wrapValues,
}: {
  appointment: FullAppointment;
  model: ReturnType<typeof useAppointmentCardModel>;
  wrapValues: boolean;
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
  const showEmbeddedStaff = Boolean(portalOwner);
  const isPatientViewer = user?.role === "patient";
  const showStaffForDashboard = !isPatientViewer;
  const TextWrap = wrapValues ? WrappingText : TruncatedText;

  return (
    <>
      <div className={appointmentCardMetaGroupClass}>
        <AppointmentCardMetaRow icon={<CalendarDays className="h-3.5 w-3.5" />}>
          <span className={clsx(isDone && "line-through text-gray-400")}>{formattedDate}</span>
        </AppointmentCardMetaRow>
        <AppointmentCardMetaRow icon={<Clock3 className="h-3.5 w-3.5" />}>
          <span className={clsx(isDone && "line-through text-gray-400")}>{formattedTime}</span>
        </AppointmentCardMetaRow>
        <AppointmentCardMetaRow icon={<MapPin className="h-3.5 w-3.5" />} wrap={wrapValues}>
          {wrapValues ? (
            <WrappingText className={isDone ? "text-gray-400" : "text-gray-700"}>
              {appointment.location || "--"}
            </WrappingText>
          ) : (
            <span className={clsx("truncate text-gray-700", isDone && "text-gray-400")}>
              {appointment.location || "--"}
            </span>
          )}
        </AppointmentCardMetaRow>
      </div>

      <div className={clsx(appointmentCardMetaGroupClass, "text-gray-700")}>
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

        {appointment.category_data ? (
          <AppointmentCardMetaRow icon={<Tags className="h-3.5 w-3.5" />} label="Category:">
            <CategoryInlineLink
              categoryId={appointment.category_data.id}
              label={appointment.category_data.label}
              color={appointment.category_data.color}
              wrapLabel={wrapValues}
            />
          </AppointmentCardMetaRow>
        ) : null}

        <AppointmentCardMetaRow icon={<Flag className="h-3.5 w-3.5" />} label="Status:">
          <span className={clsx("text-xs font-semibold capitalize", statusClass)}>
            {appointment.status || "pending"}
          </span>
        </AppointmentCardMetaRow>

        {appointment.is_telehealth ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200/60 bg-sky-100/80 px-2 py-0.5 text-[10px] font-medium text-sky-700">
            <Video className="h-3 w-3" />
            Telehealth
          </span>
        ) : null}
      </div>

      {showEmbeddedStaff && calendarOwnerId && portalOwner ? (
        <AppointmentCardMetaRow icon={<UserCog className="h-3.5 w-3.5" />} label="Calendar owner:">
          <PortalStaffLink
            staffUserId={portalOwner.id}
            staffRole={portalOwner.role}
            label={ownerLabel}
            wrapLabel={wrapValues}
          />
        </AppointmentCardMetaRow>
      ) : null}

      {showEmbeddedStaff && treatingDiffersFromOwner && portalTreating ? (
        <AppointmentCardMetaRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Treating physician:">
          <PortalStaffLink
            staffUserId={portalTreating.id}
            staffRole={portalTreating.role}
            label={treatingPhysicianLabel}
            wrapLabel={wrapValues}
          />
        </AppointmentCardMetaRow>
      ) : null}

      {showStaffForDashboard && calendarOwnerId ? (
        <AppointmentCardMetaRow icon={<UserCog className="h-3.5 w-3.5" />} label="Calendar owner:">
          <RoleEntityLink kind="doctor" id={calendarOwnerId} label={ownerLabel} wrapLabel={wrapValues} className="text-xs font-medium" />
        </AppointmentCardMetaRow>
      ) : null}

      {showStaffForDashboard && treatingDiffersFromOwner ? (
        <AppointmentCardMetaRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Treating physician:">
          <RoleEntityLink
            kind="doctor"
            id={treatingPhysicianId}
            label={treatingPhysicianLabel}
            wrapLabel={wrapValues}
            className="text-xs font-medium"
          />
        </AppointmentCardMetaRow>
      ) : null}

      {primaryDoctorId && primaryDoctorLabel ? (
        <AppointmentCardMetaRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Primary doctor:">
          {isPatientViewer ? (
            <PortalStaffLink
              staffUserId={primaryDoctorId}
              staffRole="doctor"
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

      {appointment.notes ? (
        <div className="flex min-w-0 items-start gap-1.5">
          <NotebookPen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="shrink-0 text-xs text-gray-400">Note:</span>
          <TextWrap
            className={clsx("text-xs", isDone ? "text-gray-400" : "text-gray-600")}
            title={appointment.notes}
          >
            {appointment.notes}
          </TextWrap>
        </div>
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
  asHoverTrigger,
  asTrigger,
  triggerClassName,
  onTriggerClick,
}: AppointmentCardProps) {
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
      userId={user?.id}
      userEmail={user?.email}
      userRole={user?.role}
      onToggleStatus={onToggleStatus}
      onEdit={() => onEdit(appointment)}
      onDelete={onDelete}
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

  const compactMeta =
    density === "compact" ? (
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-[10px] text-gray-500">
        <span className="truncate">{model.formattedDate}</span>
        <span className="truncate">{model.formattedTime}</span>
        <span className="truncate">{model.patientLabel}</span>
      </div>
    ) : null;

  const body =
    density === "full" ? (
      <AppointmentCardMeta appointment={appointment} model={model} wrapValues={wrapValues} />
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
