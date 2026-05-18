/**
 * Radix hover wrapper around shared `AppointmentCard`.
 * Grid triggers use compact/minimal density; popover body is always full meta at fixed width.
 *
 * IMPORTANT — why we wrap AppointmentCard in a plain <div> for the trigger:
 * Radix HoverCard with `asChild` uses Slot to merge its pointer-event handlers
 * (onPointerEnter / onPointerLeave) into the immediate child. When the child is a
 * React component (AppointmentCard), those handlers land on the component props but
 * are never forwarded to the actual DOM node, so hover never fires. Wrapping in a
 * native <div> lets Radix attach its events directly to the DOM element.
 *
 * Uncontrolled open state — Radix handles pointer hover
 * (controlled + click toggle broke hover on calendar grid blocks).
 */
import React, { useMemo } from "react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { AppointmentCard } from "@/components/shared/AppointmentCard";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { OwnerUserSummary } from "@/hooks/useOwnerUserSummaries";
import {
  APPOINTMENT_CARD_POPOVER_MAX_WIDTH,
  APPOINTMENT_CARD_POPOVER_WIDTH,
} from "@/lib/appointment-card";
import { dedupeAssignees } from "@/lib/appointment-assignees";
import type { Appointment, AppointmentAssignee, Category, Patient } from "@/types/types";

export { dedupeAssignees };

export interface AppointmentHoverCardProps {
  appointment: Appointment & {
    category_data?: Category;
    appointment_assignee?: AppointmentAssignee[];
  };
  patients: Patient[];
  assignees: AppointmentAssignee[];
  userEmail: string | null;
  userId: string | null;
  ownerUsers: OwnerUserSummary[];
  /** @deprecated Unused — badges use real calendar today via `AppointmentDateTag`. */
  getDateTag?: (date: Date) => React.ReactNode;
  /** @deprecated Unused — do not pass `DateContext.currentDate`. */
  referenceDate?: Date;
  /** Week/month: full wrapped popover text. */
  detailWrap?: boolean;
  /** Day/week block height — drives compact vs minimal trigger. */
  slotHeightPx?: number;
  onEdit: (
    appt: Appointment & { category_data?: Category; appointment_assignee?: AppointmentAssignee[] }
  ) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: string) => void;
  showDetails?: boolean;
  triggerContent?: React.ReactNode;
}

const AppointmentHoverCard: React.FC<AppointmentHoverCardProps> = ({
  appointment: a,
  patients,
  assignees,
  userEmail: _userEmail,
  userId: _userId,
  ownerUsers,
  getDateTag: _getDateTag,
  referenceDate: _referenceDate,
  detailWrap: _detailWrap,
  slotHeightPx,
  onEdit,
  onDelete,
  onToggleStatus,
  showDetails = false,
  triggerContent,
}) => {
  const fullAppt = a as FullAppointment;

  const handleToggle = (id: string, status: "pending" | "done" | "alert") => {
    onToggleStatus(id, status);
  };

  const triggerVariant = showDetails ? "compact" : "minimal";

  const triggerNode = useMemo(() => {
    if (triggerContent && React.isValidElement(triggerContent)) {
      return triggerContent;
    }
    return null;
  }, [triggerContent]);

  // Non-minimal triggers fill their parent slot (day/week grid block); minimal triggers auto-size.
  const triggerWrapClass = triggerVariant !== "minimal" ? "h-full w-full" : undefined;

  return (
    <HoverCard key={a.id} openDelay={0} closeDelay={150}>
      {/* Native div wrapper so Radix can attach onPointerEnter/onPointerLeave directly to DOM */}
      <HoverCardTrigger asChild>
        <div className={triggerWrapClass}>
          {triggerNode ?? (
            <AppointmentCard
              variant={triggerVariant}
              appointment={fullAppt}
              patients={patients}
              assignees={assignees}
              ownerUsers={ownerUsers}
              slotHeightPx={slotHeightPx}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={handleToggle}
              asTrigger
              asHoverTrigger
              onTriggerClick={(e) => {
                e.stopPropagation();
              }}
            />
          )}
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        side="bottom"
        sideOffset={8}
        align="center"
        // p-0 overflow-hidden: AppointmentCard popover variant owns all padding so SVG bar sits at true card edge:
        className={`relative z-[60] overflow-hidden border border-gray-200 bg-white shadow-xl ${APPOINTMENT_CARD_POPOVER_WIDTH} ${APPOINTMENT_CARD_POPOVER_MAX_WIDTH}`}
      >
        <AppointmentCard
          variant="popover"
          appointment={fullAppt}
          patients={patients}
          assignees={assignees}
          ownerUsers={ownerUsers}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={handleToggle}
        />
      </HoverCardContent>
    </HoverCard>
  );
};

export default AppointmentHoverCard;
