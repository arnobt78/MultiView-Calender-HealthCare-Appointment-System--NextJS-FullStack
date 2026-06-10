"use client";

/**
 * NotificationsManagement — SSR seed + useCpListBodyLoading; header chrome always mounted.
 */

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/types/notification";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  buildMarkAllNotificationsReadConfirmSubtitle,
  MARK_ALL_NOTIFICATIONS_READ_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  BellOff,
  CheckCheck,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import { queryKeys } from "@/lib/query-keys";

const columnHelper = createColumnHelper<Notification>();

const TYPE_COLORS: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  invitation: "bg-purple-100 text-purple-700",
  reminder: "bg-orange-100 text-orange-700",
};

export default function NotificationsManagement() {
  const { notifications, unreadCount, isLoading, isError: notificationsError, markAsRead, markAllAsRead, isMarkingRead } = useNotifications();
  const listBodyLoading = useCpListBodyLoading(queryKeys.notifications.all, isLoading);
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [markAllConfirmOpen, setMarkAllConfirmOpen] = useState(false);

  const columns = [
    columnHelper.accessor("read", {
      header: "",
      cell: (info) =>
        info.getValue() ? null : (
          <span className="inline-block h-2 w-2 rounded-full bg-primary" title="Unread" />
        ),
      size: 24,
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => (
        <Badge className={`capitalize ${TYPE_COLORS[info.getValue()] ?? "bg-gray-100 text-gray-700"}`}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("message", {
      header: "Message",
      cell: (info) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-sm">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Received",
      cell: (info) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(info.getValue()), "dd MMM yyyy, HH:mm")}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const n = row.original;
        return (
          <div className="flex items-center gap-1">
            {n.link && (
              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <a href={n.link} target="_blank" rel="noopener noreferrer" title="Open link">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            {!n.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => markAsRead(n.id)}
                disabled={isMarkingRead}
                title="Mark as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: notifications,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (notificationsError) {
    return (
      <div className={controlPanelSectionRootClass}>
        <AppSectionErrorBanner>
          Failed to load notifications. Please refresh.
        </AppSectionErrorBanner>
      </div>
    );
  }

  return (
    <div className={controlPanelSectionRootClass}>
      <ControlPanelPageChrome
        tab="notifications"
        description={
          listBodyLoading ? undefined : `${notifications.length} total notifications`
        }
        actions={
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 ? (
            <Badge className="bg-primary text-primary-foreground">{unreadCount} unread</Badge>
          ) : null}
          <Input
            placeholder="Filter notifications…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-52"
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={unreadCount === 0 || isMarkingRead}
            onClick={() => unreadCount > 0 && setMarkAllConfirmOpen(true)}
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
          <ConfirmActionDialog
            open={markAllConfirmOpen}
            onOpenChange={setMarkAllConfirmOpen}
            variant="info"
            title={MARK_ALL_NOTIFICATIONS_READ_TITLE}
            subtitle={buildMarkAllNotificationsReadConfirmSubtitle(unreadCount)}
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            confirmDisabled={isMarkingRead}
            onConfirm={() => {
              markAllAsRead();
              setMarkAllConfirmOpen(false);
            }}
          />
        </div>
        }
      />

      {/* Table — glass card shell always visible; body rows pulse while loading */}
      <div className="rounded-[28px] border bg-gradient-to-br from-purple-500/5 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(168,85,247,0.08)] overflow-hidden">
        <Table>
          {/* Table headers always stay static */}
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/40">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" ? " ↑" : header.column.getIsSorted() === "desc" ? " ↓" : ""}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {listBodyLoading ? (
              /* Skeleton rows: read dot, type badge, title, message, received, actions */
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-2 w-2 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-14 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <BellOff className="h-10 w-10 opacity-30" />
                    <p className="font-medium">No notifications</p>
                    <p className="text-sm">You&apos;re all caught up!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`hover:bg-muted/30 transition-colors ${!row.original.read ? "bg-primary/5" : ""}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!listBodyLoading && (
          <div className="px-4 py-2 border-t text-xs text-muted-foreground flex items-center gap-2">
            <Trash2 className="h-3 w-3" />
            {table.getRowModel().rows.length} of {notifications.length} notifications shown
          </div>
        )}
      </div>
    </div>
  );
}
