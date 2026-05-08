"use client";

/**
 * ActivitiesManagement — inline skeleton pattern:
 *   - Heading, type-filter pills, search input, and table headers stay mounted.
 *   - Only table body rows pulse as skeletons while loading.
 *   - `isMounted` + `requestAnimationFrame` guard prevents hydration flicker.
 */

import { useState, useEffect } from "react";
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
  // Sentinel — never collides with a real activity.type value from the API.
  const ALL_TYPES = "__ALL__" as const;
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);

  const uniqueTypes = Array.from(new Set(activities.map((a) => a.type))).sort();

  const filtered =
    typeFilter === ALL_TYPES ? activities : activities.filter((a) => a.type === typeFilter);

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

  /** Mount guard: prevents hydration flash — same as PatientManagement pattern. */
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const loading = !isMounted || isLoading;

  if (isError) {
    return <p className="p-4 text-red-500">Error: {(error as Error)?.message}</p>;
  }

  return (
    <div className="space-y-2 pb-3">
      {/* Chrome — heading, type-filter pills, and search input always static */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-emerald-500" />
            Activity Log
          </h2>
          {loading ? (
            <Skeleton className="h-4 w-36 mt-1 rounded" />
          ) : (
            <p className="text-sm text-muted-foreground">{activities.length} total activities</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Type filter pills — always visible; pills are static chrome */}
          <div className="flex bg-muted rounded-2xl p-1 gap-1">
            {/* "All" pill uses the sentinel constant so it never collides with a real type value. */}
            {(loading ? [ALL_TYPES] : [ALL_TYPES, ...uniqueTypes]).map((t) => (
              <button
                key={t === ALL_TYPES ? "filter-all" : `type-${t}`}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${typeFilter === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === ALL_TYPES ? "All" : t.replace(/_/g, " ")}
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

      {/* Table — glass card shell always visible; body rows pulse while loading */}
      <div className="rounded-[28px] border bg-gradient-to-br from-emerald-500/5 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(16,185,129,0.08)] overflow-hidden">
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
            {loading ? (
              /* Skeleton rows: type badge, description, appointment link, by user, time */
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-56 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 rounded" /></TableCell>
                </TableRow>
              ))
            ) : activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <ActivityIcon className="h-10 w-10 opacity-30" />
                    <p className="font-medium">No activities yet</p>
                    <p className="text-sm">Activity log entries will appear here as actions are performed.</p>
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
        {!loading && (
          <div className="px-4 py-2 border-t text-xs text-muted-foreground">
            {table.getRowModel().rows.length} of {filtered.length} activities
          </div>
        )}
      </div>
    </div>
  );
}
