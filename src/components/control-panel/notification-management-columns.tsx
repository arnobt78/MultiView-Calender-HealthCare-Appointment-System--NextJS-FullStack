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
  cpClinicalListNotificationLinkColumnShellClass,
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
import { cn } from "@/lib/utils";

export type BuildNotificationManagementColumnsOpts = {
  onMarkAsRead: (id: string) => void;
  isMarkingRead: boolean;
};

function canNavigateNotification(n: Notification): boolean {
  return n.link_valid === true && Boolean(n.link?.trim());
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

function NotificationLinkCell({ notification: n }: { notification: Notification }) {
  const link = n.link?.trim();
  const navigable = canNavigateNotification(n);

  if (!navigable || !link) {
    return (
      <div className="flex min-h-[2.75rem] items-center">
        <span className={cn(clinicalCellMutedTextClass, "text-xs")} title="Link unavailable">
          {link && n.link_valid === false ? "Unavailable" : "—"}
        </span>
      </div>
    );
  }
  if (isInternalNotificationLink(link)) {
    return (
      <div className="flex min-h-[2.75rem] items-center">
        <PrefetchingLink
          href={link}
          className={cn(
            "inline-flex max-w-full items-center gap-1 truncate text-sm text-sky-700 hover:text-sky-900",
            clinicalCellMutedTextClass
          )}
          title={link}
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">View</span>
        </PrefetchingLink>
      </div>
    );
  }
  return (
    <div className="flex min-h-[2.75rem] items-center">
      <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" asChild>
        <a href={link} target="_blank" rel="noopener noreferrer" title={link}>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          External
        </a>
      </Button>
    </div>
  );
}

/** CP notifications list — shared DataTable column defs. */
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
      cell: ({ row }) => {
        const n = row.original;
        const cfg = getNotificationTypeConfig(n.type);
        return (
          <div
            className={cn(
              "flex min-h-[2.75rem] min-w-0 flex-col justify-center gap-0.5 py-0.5",
              !n.read && "border-l-2 border-rose-400 pl-2"
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              {!n.read ? (
                <span
                  className={cn("inline-block h-2 w-2 shrink-0 rounded-full", cfg.dotClass)}
                  title="Unread"
                  aria-hidden
                />
              ) : null}
              <span className={cn("line-clamp-1 min-w-0 font-medium", clinicalCellPrimaryTextClass)}>
                {n.title}
              </span>
            </div>
            <span className={cn("line-clamp-2 text-xs", clinicalCellMutedTextClass)}>
              {n.message}
            </span>
          </div>
        );
      },
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
      id: "link",
      accessorFn: (row) => row.link ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Link" />
      ),
      enableSorting: false,
      meta: { shellClassName: cpClinicalListNotificationLinkColumnShellClass },
      cell: ({ row }) => <NotificationLinkCell notification={row.original} />,
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
