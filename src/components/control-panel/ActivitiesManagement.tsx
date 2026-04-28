"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { apiClient } from "@/lib/api-client";
import type { Activity } from "@/types/types";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity as ActivityIcon, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { queryKeys } from "@/lib/query-keys";

const columnHelper = createColumnHelper<Activity>();

const TYPE_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  comment: "bg-purple-100 text-purple-700",
  status_change: "bg-yellow-100 text-yellow-700",
  file_upload: "bg-orange-100 text-orange-700",
  invite: "bg-indigo-100 text-indigo-700",
};

export default function ActivitiesManagement() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.activities.list,
    queryFn: () =>
      apiClient<{ activities: Activity[] }>("/api/activities").then((d) => d.activities || []),
  });

  const activities = data ?? [];
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const uniqueTypes = Array.from(new Set(activities.map((a) => a.type))).sort();

  const filtered =
    typeFilter === "all" ? activities : activities.filter((a) => a.type === typeFilter);

  const columns = [
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => (
        <Badge className={`capitalize text-xs ${TYPE_COLORS[info.getValue()] ?? "bg-gray-100 text-gray-700"}`}>
          {info.getValue().replace(/_/g, " ")}
        </Badge>
      ),
    }),
    columnHelper.accessor("content", {
      header: "Description",
      cell: (info) => (
        <span className="text-sm line-clamp-2 max-w-md">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("appointment", {
      header: "Appointment",
      cell: (info) => (
        <Link
          href={`/control-panel/appointments/${info.getValue()}`}
          className="font-mono text-xs text-gray-700 hover:underline flex items-center gap-1"
        >
          <LinkIcon className="h-3 w-3" />
          #{info.getValue().slice(0, 8)}
        </Link>
      ),
    }),
    columnHelper.accessor("created_by", {
      header: "By User",
      cell: (info) => (
        <span className="font-mono text-xs text-muted-foreground">
          {info.getValue() ? `#${info.getValue().slice(0, 8)}` : "—"}
        </span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Time",
      cell: (info) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(info.getValue()), "dd MMM yyyy, HH:mm")}
        </span>
      ),
    }),
  ];

  const table = useReactTable({
    data: filtered,
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
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return <p className="p-4 text-red-500">Error: {(error as Error)?.message}</p>;
  }

  return (
    <div className="space-y-2 animate-in fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ActivityIcon className="h-6 w-6" />
            Activity Log
          </h2>
          <p className="text-sm text-muted-foreground">{activities.length} total activities</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-muted rounded-2xl p-1 gap-1">
            {["all", ...uniqueTypes].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${typeFilter === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "all" ? "All" : t.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <Input
            placeholder="Search activities…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ActivityIcon className="h-10 w-10 text-muted-foreground mb-3" />
            <CardHeader className="p-0">
              <CardTitle className="text-base">No activities yet</CardTitle>
            </CardHeader>
            <p className="text-sm text-muted-foreground mt-1">
              Activity log entries will appear here as actions are performed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
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
                  <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
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
          <div className="px-4 py-2 border-t text-xs text-muted-foreground">
            {table.getRowModel().rows.length} of {filtered.length} activities
          </div>
        </div>
      )}
    </div>
  );
}
