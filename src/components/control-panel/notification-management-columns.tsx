"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckCheck,
  EllipsisVertical,
  ExternalLink,
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { NotificationTypeBadge } from "@/components/control-panel/NotificationTypeBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Notification } from "@/types/notification";
import {
  cpClinicalListActionsColumnShellClass,
  cpClinicalListNotificationContentColumnShellClass,
  cpClinicalListNotificationReceivedColumnShellClass,
  cpClinicalListNotificationTypeColumnShellClass,
} from "@/lib/cp-clinical-list-table-classes";
import {
  clinicalCellMutedTextClass,
  clinicalCellPrimaryTextClass,
} from "@/lib/table-display-styles";
import {
  getNotificationTypeConfig,
  isInternalNotificationLink,
} from "@/lib/notification-type-display";
import {
  canNavigateNotification,
  notificationRowActionCount,
} from "@/lib/notification-navigation";
import { cn } from "@/lib/utils";

export type BuildNotificationManagementColumnsOpts = {
  onMarkAsRead: (id: string) => void;
  isMarkingRead: boolean;
};

const navigableTitleClass =
  "line-clamp-1 min-w-0 font-medium text-sky-700 hover:text-sky-800";

/** Notification body — clickable when link_valid; static when target deleted. */
function NotificationContentCell({
  notification: n,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  const cfg = getNotificationTypeConfig(n.type);
  const link = n.link?.trim();
  const navigable = canNavigateNotification(n);
  const internal = link ? isInternalNotificationLink(link) : false;

  const handleNavigateSideEffect = () => {
    if (!n.read) onMarkAsRead(n.id);
  };

  const titleRow = (
    <div className="flex min-w-0 items-center gap-2">
      {!n.read ? (
        <span
          className={cn("inline-block h-2 w-2 shrink-0 rounded-full", cfg.dotClass)}
          title="Unread"
          aria-hidden
        />
      ) : null}
      <span
        className={cn(
          navigable ? navigableTitleClass : cn("line-clamp-1 min-w-0 font-medium", clinicalCellPrimaryTextClass)
        )}
      >
        {n.title}
      </span>
      {navigable && internal ? (
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-sky-600/80" aria-hidden />
      ) : null}
    </div>
  );

  const messageRow = (
    <span className={cn("line-clamp-2 text-xs", clinicalCellMutedTextClass)}>{n.message}</span>
  );

  const shellClass = cn(
    "flex min-h-[2.75rem] min-w-0 flex-col justify-center gap-0.5 py-0.5",
    !n.read && "border-l-2 border-rose-400 pl-2",
    navigable && "cursor-pointer"
  );

  if (!navigable || !link) {
    return (
      <div className={shellClass}>
        {titleRow}
        {messageRow}
      </div>
    );
  }

  if (internal) {
    return (
      <PrefetchingLink
        href={link}
        className={cn(shellClass, "block min-w-0 no-underline")}
        title={link}
        onClick={handleNavigateSideEffect}
      >
        {titleRow}
        {messageRow}
      </PrefetchingLink>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(shellClass, "block min-w-0 no-underline")}
      title={link}
      onClick={handleNavigateSideEffect}
    >
      {titleRow}
      {messageRow}
    </a>
  );
}

function NotificationRowActions({
  notification: n,
  onMarkAsRead,
  isMarkingRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  isMarkingRead: boolean;
}) {
  const link = n.link?.trim();
  const navigable = canNavigateNotification(n);
  const internal = isInternalNotificationLink(link);
  const actionCount = notificationRowActionCount(n);

  if (actionCount === 0) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        disabled
        title="No actions available"
        aria-label="No actions available"
      >
        <EllipsisVertical className="h-4 w-4 opacity-40" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
          <EllipsisVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!n.read ? (
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2"
            disabled={isMarkingRead}
            onSelect={() => onMarkAsRead(n.id)}
          >
            <CheckCheck className="h-4 w-4" />
            Mark as read
          </DropdownMenuItem>
        ) : null}
        {navigable && link ? (
          internal ? (
            <DropdownMenuItem asChild>
              <PrefetchingLink href={link} className="flex cursor-pointer items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Open link
              </PrefetchingLink>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open link
              </a>
            </DropdownMenuItem>
          )
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** CP notifications list — shared DataTable column defs (no separate Link column). */
export function buildNotificationManagementColumns(
  opts: BuildNotificationManagementColumnsOpts
): ColumnDef<Notification>[] {
  const { onMarkAsRead, isMarkingRead } = opts;

  return [
    {
      id: "type",
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      meta: { shellClassName: cpClinicalListNotificationTypeColumnShellClass },
      cell: ({ row }) => (
        <div className="flex min-h-[2.75rem] items-center">
          <NotificationTypeBadge type={row.original.type} />
        </div>
      ),
    },
    {
      id: "content",
      accessorFn: (row) => `${row.title} ${row.message}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Notification" />
      ),
      meta: { shellClassName: cpClinicalListNotificationContentColumnShellClass },
      cell: ({ row }) => (
        <NotificationContentCell
          notification={row.original}
          onMarkAsRead={onMarkAsRead}
        />
      ),
    },
    {
      id: "received",
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Received" />
      ),
      meta: { shellClassName: cpClinicalListNotificationReceivedColumnShellClass },
      cell: ({ row }) => {
        const raw = row.original.created_at;
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) {
          return (
            <div className="flex min-h-[2.75rem] items-center">
              <span className={clinicalCellMutedTextClass}>—</span>
            </div>
          );
        }
        return (
          <div className="flex min-h-[2.75rem] flex-col justify-center gap-0.5">
            <span className={cn("whitespace-nowrap text-sm", clinicalCellMutedTextClass)}>
              {format(date, "dd MMM yyyy, HH:mm")}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" className="text-right" />
      ),
      enableSorting: false,
      meta: { shellClassName: cpClinicalListActionsColumnShellClass },
      cell: ({ row }) => (
        <div className="flex min-h-[2.75rem] items-center justify-end">
          <NotificationRowActions
            notification={row.original}
            onMarkAsRead={onMarkAsRead}
            isMarkingRead={isMarkingRead}
          />
        </div>
      ),
    },
  ];
}
