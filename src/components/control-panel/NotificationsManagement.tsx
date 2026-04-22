"use client";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  BellOff,
  CheckCheck,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

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
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, isMarkingRead } = useNotifications();
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground ml-1">{unreadCount} unread</Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">{notifications.length} total notifications</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Filter notifications…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-52"
          />
          {unreadCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CheckCheck className="h-4 w-4" /> Mark all read
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark all as read?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark all {unreadCount} unread notifications as read.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => markAllAsRead()}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BellOff className="h-10 w-10 text-muted-foreground mb-3" />
            <CardHeader className="p-0">
              <CardTitle className="text-base">No notifications</CardTitle>
            </CardHeader>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;re all caught up! Notifications will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border bg-card shadow-sm overflow-hidden">
          <Table>
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
              {table.getRowModel().rows.length === 0 ? (
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
          <div className="px-4 py-2 border-t text-xs text-muted-foreground flex items-center gap-2">
            <Trash2 className="h-3 w-3" />
            {table.getRowModel().rows.length} of {notifications.length} notifications shown
          </div>
        </div>
      )}
    </div>
  );
}
