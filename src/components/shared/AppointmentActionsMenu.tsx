"use client";

/**
 * Global appointment ⋮ menu — View Details, Mark done/open, Edit, Delete.
 * All four items always visible; disabled when role/assignee denies action.
 * View href: admin → control-panel; doctor/patient → /appointments/:id.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Receipt,
  MoreVertical,
  Eye,
  CheckCircle,
  Circle,
  Pencil,
  Trash2,
  Ban,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { appointmentDetailHref } from "@/lib/entity-routes";
import { getAppointmentMenuCapabilities } from "@/lib/appointment-menu-permissions";
import { useInitialNavRole } from "@/context/NavRoleContext";
import { cn } from "@/lib/utils";
import type { AppointmentAssignee } from "@/types/types";

type AppointmentMenuTarget = {
  id: string;
  user_id: string;
  status?: string | null;
  treating_physician_id?: string | null;
  appointment_assignee?: AppointmentAssignee[];
};

type AppointmentActionsMenuProps = {
  appointment: AppointmentMenuTarget;
  userId?: string | null;
  userEmail?: string | null;
  /** Auth role; falls back to SSR `initialNavRole` for stable href on first paint. */
  userRole?: string | null;
  onToggleStatus: (id: string, nextStatus: "pending" | "done") => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onCancel?: (id: string) => void;
  /** Staff billing — preset create from this visit. */
  onCreateInvoice?: (appointmentId: string) => void;
  showCreateInvoice?: boolean;
  /** Google Calendar — manual push when connector is linked. */
  showSyncToGoogle?: boolean;
  onSyncToGoogle?: (id: string) => void;
  isSyncingGoogle?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
};

/** Disabled rows stay visible but non-interactive. */
const disabledItemClass =
  "gap-2 opacity-50 cursor-not-allowed focus:bg-transparent data-[disabled]:opacity-50";

/** View + Edit — sky hover/focus (icon follows text). */
const skyActionClass =
  "gap-2 text-slate-700 [&_svg]:text-slate-500 focus:bg-sky-50 focus:text-sky-700 data-[highlighted]:bg-sky-50 data-[highlighted]:text-sky-700 data-[highlighted]:[&_svg]:text-sky-600";

/** Mark as done — green hover/focus. */
const toggleDoneClass =
  "gap-2 text-green-700 [&_svg]:text-green-600 focus:bg-green-50 focus:text-green-700 data-[highlighted]:bg-green-50 data-[highlighted]:text-green-700 data-[highlighted]:[&_svg]:text-green-700";

/** Mark as open — amber hover/focus. */
const toggleOpenClass =
  "gap-2 text-amber-700 [&_svg]:text-amber-600 focus:bg-amber-50 focus:text-amber-800 data-[highlighted]:bg-amber-50 data-[highlighted]:text-amber-800 data-[highlighted]:[&_svg]:text-amber-700";

/** Delete — rose hover/focus (overrides destructive default on highlight). */
const deleteActionClass =
  "gap-2 text-rose-600 [&_svg]:text-rose-500 focus:bg-rose-50 focus:text-rose-700 data-[highlighted]:bg-rose-50 data-[highlighted]:text-rose-700 data-[highlighted]:[&_svg]:text-rose-600";

/** Create invoice — amber hover/focus (billing). */
const createInvoiceClass =
  "gap-2 text-amber-800 [&_svg]:text-amber-600 focus:bg-amber-50 focus:text-amber-900 data-[highlighted]:bg-amber-50 data-[highlighted]:text-amber-900 data-[highlighted]:[&_svg]:text-amber-700";

/** Cancel — slate hover/focus. */
const cancelActionClass =
  "gap-2 text-slate-700 [&_svg]:text-slate-600 focus:bg-slate-50 focus:text-slate-800 data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-800 data-[highlighted]:[&_svg]:text-slate-700";

export function AppointmentActionsMenu({
  appointment,
  userId,
  userEmail,
  userRole,
  onToggleStatus,
  onEdit,
  onDelete,
  onCancel,
  onCreateInvoice,
  showCreateInvoice = false,
  showSyncToGoogle = false,
  onSyncToGoogle,
  isSyncingGoogle = false,
  triggerClassName,
  contentClassName,
}: AppointmentActionsMenuProps) {
  const initialNavRole = useInitialNavRole();
  const role = userRole ?? initialNavRole;
  const isDone = appointment.status === "done";
  const isCancelled = appointment.status === "cancelled";
  const [cancelOpen, setCancelOpen] = useState(false);

  const capabilities = useMemo(
    () =>
      getAppointmentMenuCapabilities({
        appointment,
        assignees: appointment.appointment_assignee,
        userId,
        userEmail,
        userRole: role,
      }),
    [appointment, userId, userEmail, role]
  );

  const viewHref = appointmentDetailHref(role, appointment.id);

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={
            triggerClassName ??
            "h-8 w-8 rounded-full hover:bg-black/10"
          }
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={contentClassName ?? "w-56"}
      >
        <DropdownMenuItem
          asChild={capabilities.canView}
          disabled={!capabilities.canView}
          className={cn(
            capabilities.canView ? skyActionClass : disabledItemClass
          )}
        >
          {capabilities.canView ? (
            <Link
              href={viewHref}
              className="flex w-full items-center gap-2 outline-none"
            >
              <Eye className="h-4 w-4" />
              <span>View Details</span>
            </Link>
          ) : (
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>View Details</span>
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={!capabilities.canToggleStatus}
          className={cn(
            capabilities.canToggleStatus
              ? isDone
                ? toggleOpenClass
                : toggleDoneClass
              : disabledItemClass
          )}
          onClick={() => {
            if (!capabilities.canToggleStatus) return;
            onToggleStatus(appointment.id, isDone ? "pending" : "done");
          }}
        >
          {isDone ? (
            <>
              <Circle className="h-4 w-4" />
              <span>Mark as open</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Mark as done</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={!capabilities.canEdit || isCancelled}
          className={cn(
            capabilities.canEdit && !isCancelled ? skyActionClass : disabledItemClass
          )}
          onClick={() => {
            if (!capabilities.canEdit || isCancelled) return;
            onEdit();
          }}
        >
          <Pencil className="h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>

        {onSyncToGoogle && showSyncToGoogle ? (
          <DropdownMenuItem
            disabled={isCancelled || isSyncingGoogle}
            className={cn(
              !isCancelled && !isSyncingGoogle ? skyActionClass : disabledItemClass
            )}
            onClick={() => {
              if (isCancelled || isSyncingGoogle) return;
              onSyncToGoogle(appointment.id);
            }}
          >
            <Calendar className="h-4 w-4" />
            <span>{isSyncingGoogle ? "Syncing…" : "Sync to Google Calendar"}</span>
          </DropdownMenuItem>
        ) : null}

        {onCancel ? (
          <DropdownMenuItem
            disabled={!capabilities.canCancel}
            className={cn(
              capabilities.canCancel ? cancelActionClass : disabledItemClass
            )}
            onClick={() => {
              if (!capabilities.canCancel) return;
              setCancelOpen(true);
            }}
          >
            <Ban className="h-4 w-4" />
            <span>Cancel appointment</span>
          </DropdownMenuItem>
        ) : null}

        {onCreateInvoice && (
          <DropdownMenuItem
            disabled={!showCreateInvoice}
            className={cn(
              showCreateInvoice ? createInvoiceClass : disabledItemClass
            )}
            onClick={() => {
              if (!showCreateInvoice) return;
              onCreateInvoice(appointment.id);
            }}
          >
            <Receipt className="h-4 w-4" />
            <span>Create invoice</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          disabled={!capabilities.canDelete}
          className={cn(
            capabilities.canDelete ? deleteActionClass : disabledItemClass
          )}
          onClick={() => {
            if (!capabilities.canDelete) return;
            onDelete(appointment.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {onCancel ? (
      <ConfirmActionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        variant="warning"
        title="Cancel appointment?"
        subtitle="This visit will be marked cancelled. Stakeholders will be notified."
        confirmLabel="Cancel visit"
        onConfirm={() => {
          onCancel(appointment.id);
          setCancelOpen(false);
        }}
      />
    ) : null}
    </>
  );
}
