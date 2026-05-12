/**
 * Hover summary for a calendar block or list row. Shows the appointment client as **Client** (`patient_id` / roster).
 * Calendar owner appears under **Assigned by** when sharing metadata exists — avoid a second line that repeated the client as "Refer to" (Phase D / B1 label clarity).
 */
import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { format } from "date-fns";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import {
  FiPaperclip,
} from "react-icons/fi";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Flag,
  UserRound,
  Users,
  NotebookPen,
  CheckSquare,
  Square,
  Pencil,
  Trash2,
} from "lucide-react";
import type {
  Appointment,
  Category,
  Patient,
  Relative,
  AppointmentAssignee,
  Activity,
} from "@/types/types";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
// Using Vercel Blob for file storage
import { getPublicUrl } from "@/lib/vercelBlob";



export interface AppointmentHoverCardProps {
  appointment: Appointment & { category_data?: Category; appointment_assignee?: AppointmentAssignee[] };
  patients: Patient[];
  relatives: Relative[];
  assignees: AppointmentAssignee[];
  activities: Activity[];
  userEmail: string | null;
  userId: string | null;
  ownerUsers: { id: string, email: string }[]; // Add owner users data
  getDateTag: (date: Date) => React.ReactNode;
  onEdit: (appt: Appointment & { category_data?: Category; appointment_assignee?: AppointmentAssignee[] }) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: string) => void;
  showDetails?: boolean; // default false
  triggerContent?: React.ReactNode;
}

export function dedupeAssignees(
  assignees: AppointmentAssignee[],
  appointmentId: string
): AppointmentAssignee[] {
  const filteredAssignees = assignees.filter((ass) => ass.appointment === appointmentId);
  const dedupedMap = new Map<string, AppointmentAssignee>();
  for (const ass of filteredAssignees) {
    const key = `${ass.user || ''}|${ass.invited_email || ''}`;
    if (!dedupedMap.has(key)) {
      dedupedMap.set(key, ass);
    } else {
      // Prefer accepted over pending, prefer higher permission
      const prev = dedupedMap.get(key)!;
      const statusOrder: Record<string, number> = { accepted: 2, pending: 1, declined: 0 };
      const permOrder: Record<string, number> = { full: 3, write: 2, read: 1 };
      const prevStatus = typeof prev.status === 'string' && statusOrder[prev.status] !== undefined ? statusOrder[prev.status] : 0;
      const currStatus = typeof ass.status === 'string' && statusOrder[ass.status] !== undefined ? statusOrder[ass.status] : 0;
      const prevPerm = typeof prev.permission === 'string' && permOrder[prev.permission] !== undefined ? permOrder[prev.permission] : 0;
      const currPerm = typeof ass.permission === 'string' && permOrder[ass.permission] !== undefined ? permOrder[ass.permission] : 0;
      if (
        currStatus > prevStatus ||
        (currStatus === prevStatus && currPerm > prevPerm)
      ) {
        dedupedMap.set(key, ass);
      }
    }
  }
  return Array.from(dedupedMap.values());
}

const AppointmentHoverCard: React.FC<AppointmentHoverCardProps> = ({
  appointment: a,
  patients,
  relatives,
  assignees,
  activities,
  userEmail,
  userId,
  ownerUsers,
  getDateTag,
  onEdit,
  onDelete,
  onToggleStatus,
  showDetails = false,
  triggerContent,
}) => {
  const [open, setOpen] = useState(false);
  const { getAppointmentColorToken } = useAppointmentColor();
  const colorToken = getAppointmentColorToken(a.id, a.category_data?.color ?? null);
  const color = colorToken.lineColor;
  const isDone = a.status === "done";
  const dedupedAssignees = dedupeAssignees(assignees, a.id);
  const patientName =
    typeof a.patient === "string" && patients.length > 0
      ? (() => {
        const p = patients.find((x) => x.id === a.patient);
        return p ? `${p.firstname} ${p.lastname}` : "--";
      })()
      : a.patient &&
        typeof a.patient === "object" &&
        "firstname" in a.patient &&
        "lastname" in a.patient
        ? `${(a.patient as Patient).firstname} ${(a.patient as Patient).lastname}`
        : "--";
  const statusTextClass =
    a.status === "done"
      ? "text-green-600"
      : a.status === "alert"
        ? "text-red-500"
        : "text-amber-600";
  const triggerNode = useMemo(() => {
    const withClick = (node: React.ReactElement<{ onClick?: React.MouseEventHandler }>) =>
      React.cloneElement(node, {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
          if (typeof node.props.onClick === "function") {
            node.props.onClick(e);
          }
        },
      });
    if (triggerContent && React.isValidElement(triggerContent))
      return withClick(triggerContent as React.ReactElement<{ onClick?: React.MouseEventHandler }>);
    return null;
  }, [triggerContent]);

  return (
    <HoverCard key={a.id} open={open} onOpenChange={setOpen} openDelay={0} closeDelay={80}>
      <HoverCardTrigger asChild>
        {triggerNode ? (
          triggerNode
        ) : showDetails ? (
          // WeekView: compact responsive card
          <div className={clsx(
            "relative z-10 flex flex-col w-full h-full overflow-hidden rounded-2xl cursor-pointer shadow-xl transition hover:brightness-110 border hover-card-rich",
            { "line-through": isDone }
          )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            style={{
              backgroundColor: colorToken.cardSurfaceColor,
              borderColor: colorToken.cardBorderColor,
            }}
          >
            <svg className="absolute left-0 top-0 bottom-0 h-full w-2 rounded-l-2xl" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 8 100">
              <rect width="8" height="100" fill={color} />
            </svg>
            <div className="hover-card-content-inner">

              <div>
                <div className="flex w-full items-center gap-2">
                  <span
                    className={clsx(
                      "truncate text-sm font-medium text-gray-700",
                      isDone && "line-through text-gray-400"
                    )}
                  >
                    {a.title}
                  </span>
                  {getDateTag(new Date(a.start))}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                    <span className={isDone ? "line-through text-gray-400" : undefined}>
                      {format(new Date(a.start), "dd.MM.yyyy")}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5 text-gray-400" />
                    <span className={isDone ? "line-through text-gray-400" : undefined}>
                      {format(new Date(a.start), "HH:mm")} – {format(new Date(a.end), "HH:mm")}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // MonthView: Simple card
          <div
            className={clsx(
              "relative z-10 flex items-center w-full overflow-hidden rounded-2xl cursor-pointer shadow-xl transition hover:brightness-110 border hover-card-simple",
              { "line-through": isDone }
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            style={{
              backgroundColor: colorToken.cardSurfaceColor,
              borderColor: colorToken.cardBorderColor,
            }}
          >
            <svg width="8" height="24" viewBox="0 0 8 24" aria-hidden="true" className="rounded-l-2xl mr-2 shrink-0">
              <rect width="8" height="24" fill={color} />
            </svg>
            <span className="truncate text-sm font-medium text-gray-700 text-left">
              {a.title}
            </span>
          </div>
        )}
      </HoverCardTrigger>


      <HoverCardContent
        side="bottom"
        sideOffset={8}
        align="center"
        className="relative min-w-[320px] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
      >
        <svg className="absolute left-0 top-0 bottom-0 h-full w-1.5 rounded-l-2xl" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 6 100">
          <rect width="6" height="100" fill={color} />
        </svg>
        <div className="px-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-base font-medium text-gray-700 flex items-center gap-1">
              {a.title}
              {getDateTag(new Date(a.start))}
            </span>
          </div>

          <div className="mb-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span className={isDone ? "line-through text-gray-400" : undefined}>
                {format(new Date(a.start), "dd.MM.yyyy")}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-gray-400" />
              <span className={isDone ? "line-through text-gray-400" : undefined}>
                {format(new Date(a.start), "HH:mm")} – {format(new Date(a.end), "HH:mm")}
              </span>
            </span>
          </div>
          <div className="mb-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className={isDone ? " text-gray-400" : undefined}>
                {a.location || "--"}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Flag className="h-4 w-4 text-gray-400" />
              <span className={clsx("capitalize font-medium", statusTextClass)}>{a.status}</span>
            </span>
          </div>

          <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
            <UserRound className="h-4 w-4 text-gray-400" />
            <span>Client</span>
            <span className="text-gray-700">{patientName}</span>
          </div>

          {a.notes && (
            <div className="mb-1 flex items-center gap-1 text-xs text-gray-600">
              <NotebookPen className="h-4 w-4 text-gray-400" />
              <span className="wrap-break-word">{a.notes}</span>
            </div>
          )}

          {a.attachments && a.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <FiPaperclip /> Attachments:
              {a.attachments.map((file, idx) => {
                // Get Vercel Blob public URL
                const publicUrl = getPublicUrl(file);
                const fileName = file.split("/").pop() || file;
                return publicUrl ? (
                  <a
                    key={idx}
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="not-italic text-blue-700 underline"
                  >
                    {fileName}
                  </a>
                ) : (
                  <span key={idx} className="text-red-600">
                    [Error: File not found]
                  </span>
                );
              })}
            </div>
          )}

          {dedupedAssignees.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <Users className="h-4 w-4 text-gray-400" /> Assigned by:
              {a.user_id === userId ? (
                // Owner view
                <span className="not-italic text-green-700">
                  you ({userEmail || "owner"})
                </span>
              ) : (
                // Invitee view: show owner's email
                <span className="not-italic text-blue-700">
                  {(() => {
                    // Find owner's email from ownerUsers
                    const owner = ownerUsers.find(u => u.id === a.user_id);
                    return owner?.email || a.user_id;
                  })()}
                </span>
              )}
            </div>
          )}

          {activities.length > 0 && (
            <div className="flex flex-col gap-1 text-xs text-gray-400 mb-1">
              <span>Activities:</span>
              {activities
                .filter((act) => act.appointment === a.id)
                .map((act, idx) => (
                  <span key={idx} className="not-italic text-pink-700">
                    {act.type}: {act.content}
                  </span>
                ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Status checkbox - only show if user is owner, full, or write permission */}
            {(() => {
              // Check if user is the owner
              const isOwner = a.user_id === userId;

              // Get user permission from assignees if not owner
              let userPermission: "full" | "write" | "read" | null = null;

              if (!isOwner && assignees && assignees.length > 0) {
                // Find the current user's assignment
                const userAssignment = assignees.find(
                  (ass) =>
                    (ass.user === userId || (!!userEmail && ass.invited_email === userEmail)) &&
                    ass.appointment === a.id &&
                    ass.status === "accepted"
                );
                userPermission = userAssignment?.permission || null;

              }

              // Only owner, full, or write can toggle status
              if (!userId || isOwner || userPermission === "full" || userPermission === "write") {
                return (
                  <label className="inline-flex items-center gap-1 rounded-md px-1 py-0.5">
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-green-200 bg-green-50 text-green-600 transition hover:bg-green-100"
                      onClick={() => onToggleStatus(a.id, isDone ? "pending" : "done")}
                      aria-label={isDone ? "Mark as open" : "Mark as done"}
                    >
                      {isDone ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
                    </button>
                    <span className="text-xs text-gray-600 select-none">
                      {isDone ? "Done" : "Open"}
                    </span>
                  </label>
                );
              }
              return null;
            })()}

            {/* Edit button - only show if user is owner or has full permission */}
            {(() => {
              // Check if user is the owner
              const isOwner = a.user_id === userId;

              // Get user permission from assignees if not owner
              let userPermission: "full" | "write" | "read" | null = null;

              if (!isOwner && assignees && assignees.length > 0) {
                // Find the current user's assignment
                const userAssignment = assignees.find(
                  (ass) =>
                    (ass.user === userId || (!!userEmail && ass.invited_email === userEmail)) &&
                    ass.appointment === a.id &&
                    ass.status === "accepted"
                );
                userPermission = userAssignment?.permission || null;

              }

              // Only owner or full can edit
              if (!userId || isOwner || userPermission === "full") {
                return (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-md border border-sky-200 bg-sky-50 text-sky-600 transition hover:bg-sky-100"
                    onClick={() => onEdit(a)}
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                );
              }
              return null;
            })()}

            {/* Delete button - only show if user is owner or has full permission */}
            {(() => {
              // Get user permission for this appointment
              let userPermission: "owner" | "full" | "write" | "read" | null = null;

              if (!userId) {
                userPermission = "owner";
              } else if (a.user_id === userId) {
                userPermission = "owner";
              } else if (assignees && assignees.length > 0) {
                // Find the current user's assignment
                const userAssignment = assignees.find(
                  (ass) =>
                    (ass.user === userId || (!!userEmail && ass.invited_email === userEmail)) &&
                    ass.appointment === a.id &&
                    ass.status === "accepted"
                );
                userPermission = userAssignment?.permission || null;
              }

              // Only owner or full can delete
              if (userPermission === "owner" || userPermission === "full") {
                return (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-md border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
                    onClick={() => onDelete(a.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default AppointmentHoverCard;
