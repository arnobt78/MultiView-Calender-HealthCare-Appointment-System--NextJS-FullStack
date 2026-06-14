"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical, ExternalLink } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import {
  GoogleCalendarEventScheduleBadge,
  GoogleCalendarEventStatusBadge,
  GoogleCalendarEventTitleTableCell,
  GoogleCalendarEventWhenTableCell,
} from "@/components/control-panel/google-calendar/google-calendar-event-table-cells";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatGoogleCalendarEventWhenRange,
  getGoogleCalendarEventScheduleLabel,
  getGoogleCalendarEventTitle,
} from "@/lib/google-calendar-display";
import { resolveGoogleCalendarEventStatusMeta } from "@/lib/google-calendar-event-status-display";
import {
  cpClinicalListActionsColumnShellClass,
  cpClinicalListAppointmentWhenColumnShellClass,
  cpClinicalListGoogleCalendarEventColumnShellClass,
  cpClinicalListGoogleCalendarStatusColumnShellClass,
  cpClinicalListGoogleCalendarTypeColumnShellClass,
} from "@/lib/cp-clinical-list-table-classes";
import type { GoogleCalendarEvent } from "@/types/google-calendar";

function GoogleCalendarEventRowActions({ event }: { event: GoogleCalendarEvent }) {
  const link = event.htmlLink?.trim();
  const actionCount = link ? 1 : 0;

  if (actionCount === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Event actions">
          <EllipsisVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Open in Google Calendar
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** CP Google events preview — shared DataTable column defs (read-only external actions). */
export function buildGoogleCalendarEventColumns(): ColumnDef<GoogleCalendarEvent>[] {
  return [
    {
      id: "summary",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Event" />,
      accessorFn: (row) => getGoogleCalendarEventTitle(row),
      meta: { shellClassName: cpClinicalListGoogleCalendarEventColumnShellClass },
      cell: ({ row }) => <GoogleCalendarEventTitleTableCell event={row.original} />,
    },
    {
      id: "when",
      header: ({ column }) => <DataTableColumnHeader column={column} title="When" />,
      accessorFn: (row) => formatGoogleCalendarEventWhenRange(row),
      meta: { shellClassName: cpClinicalListAppointmentWhenColumnShellClass },
      cell: ({ row }) => <GoogleCalendarEventWhenTableCell event={row.original} />,
    },
    {
      id: "schedule",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      accessorFn: (row) => getGoogleCalendarEventScheduleLabel(row),
      meta: { shellClassName: cpClinicalListGoogleCalendarTypeColumnShellClass },
      cell: ({ row }) => (
        <div className="flex min-h-[2.75rem] items-center py-0.5">
          <GoogleCalendarEventScheduleBadge event={row.original} />
        </div>
      ),
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      accessorFn: (row) => resolveGoogleCalendarEventStatusMeta(row.status).label,
      meta: { shellClassName: cpClinicalListGoogleCalendarStatusColumnShellClass },
      cell: ({ row }) => (
        <div className="flex min-h-[2.75rem] items-center py-0.5">
          <GoogleCalendarEventStatusBadge event={row.original} />
        </div>
      ),
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
          <GoogleCalendarEventRowActions event={row.original} />
        </div>
      ),
    },
  ];
}
