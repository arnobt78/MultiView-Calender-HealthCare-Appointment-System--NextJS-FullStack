"use client";

/**
 * AppointmentsManagement — inline skeleton pattern:
 *   - Stat card shells + heading/filter/export button always stay mounted.
 *   - Only stat values inside cards and table body rows pulse as skeletons while loading.
 *   - `isMounted` + `requestAnimationFrame` guard prevents hydration flicker.
 */

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useAppointments, type FullAppointment } from "@/hooks/useAppointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
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
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { AppointmentActionsMenu } from "@/components/shared/AppointmentActionsMenu";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { PageHeader } from "@/components/shared/PageHeader";

const columnHelper = createColumnHelper<FullAppointment>();

function exportToCSV(rows: FullAppointment[]) {
  const headers = ["Title", "Status", "Start", "End", "Location", "Notes", "Patient", "Category", "Created At"];
  const csvRows = rows.map((a) => [
    `"${(a.title ?? "").replace(/"/g, '""')}"`,
    a.status ?? "pending",
    format(new Date(a.start), "yyyy-MM-dd HH:mm"),
    format(new Date(a.end), "yyyy-MM-dd HH:mm"),
    `"${(a.location ?? "").replace(/"/g, '""')}"`,
    `"${(a.notes ?? "").replace(/"/g, '""')}"`,
    // patient_data / category_data are the resolved objects; a.patient / a.category are UUID strings.
    a.patient_data
      ? `"${(a.patient_data.firstname ?? "")} ${(a.patient_data.lastname ?? "")}"`
      : "",
    a.category_data ? `"${a.category_data.label ?? ""}"` : "",
    format(new Date(a.created_at), "yyyy-MM-dd HH:mm"),
  ]);
  const csv = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `appointments-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AppointmentsManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    appointments,
    isLoading,
    isError,
    error,
    deleteAppointment,
    toggleStatus,
    cancelAppointment,
    isDeleting,
  } = useAppointments();
  const [sorting, setSorting] = useState<SortingState>([{ id: "start", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered =
    statusFilter === "all"
      ? appointments
      : appointments.filter((a) => (a.status ?? "pending") === statusFilter);

  const columns = [
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <AppointmentStatusGlassBadge status={info.getValue()} size="compact" />
      ),
    }),
    columnHelper.accessor("start", {
      header: "Start",
      cell: (info) => (
        <span className="text-sm whitespace-nowrap">
          {format(new Date(info.getValue()), "dd MMM yyyy, HH:mm")}
        </span>
      ),
    }),
    columnHelper.accessor("end", {
      header: "End",
      cell: (info) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(info.getValue()), "HH:mm")}
        </span>
      ),
    }),
    columnHelper.accessor("category_data", {
      header: "Category",
      cell: (info) => {
        const cat = info.getValue();
        if (!cat) return <span className="text-muted-foreground">—</span>;
        return (
          <Badge variant="outline" className="gap-1">
            {cat.color && (
              <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" className="inline-block shrink-0">
                <circle cx="4" cy="4" r="4" fill={cat.color ?? "#888"} />
              </svg>
            )}
            {cat.label}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("patient_data", {
      header: "Patient",
      cell: (info) => {
        const p = info.getValue();
        if (!p) return <span className="text-muted-foreground">—</span>;
        return (
          <Link
            href={`/control-panel/patients/${p.id}`}
            className="text-sm text-gray-700 hover:underline"
          >
            {p.firstname} {p.lastname}
          </Link>
        );
      },
    }),
    columnHelper.accessor("location", {
      header: "Location",
      cell: (info) => info.getValue() ?? <span className="text-muted-foreground">—</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const appt = row.original;
        return (
          <AppointmentActionsMenu
            appointment={{
              id: appt.id,
              user_id: appt.user_id,
              status: appt.status,
              treating_physician_id: appt.treating_physician_id,
              appointment_assignee: appt.appointment_assignee,
            }}
            userId={user?.id}
            userEmail={user?.email}
            userRole={user?.role}
            onToggleStatus={(id, next) => toggleStatus({ id, status: next })}
            onEdit={() => router.push(`/control-panel/appointments/${appt.id}`)}
            onDelete={deleteAppointment}
            onCancel={cancelAppointment}
            triggerClassName="h-8 w-8"
          />
        );
      },
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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  /** Mount guard: prevents hydration flash — same as PatientManagement pattern. */
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const loading = !isMounted || isLoading;

  const doneCount = appointments.filter((a) => a.status === "done").length;
  const pendingCount = appointments.filter((a) => (a.status ?? "pending") === "pending").length;
  const alertCount = appointments.filter((a) => a.status === "alert").length;
  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length;

  if (isError) {
    return <p className="p-4 text-red-500">Error: {error?.message}</p>;
  }

  return (
    <div className={controlPanelSectionRootClass}>
      {/* Page header */}
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-500" aria-hidden />
            Appointment Management
          </span>
        }
        description="View and manage all appointments across the platform. Filter by status or export records."
      />

      {/* Stats row — card shells always visible; value slots pulse while loading */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(
          [
            { label: "Total", value: appointments.length, color: "text-foreground", variant: "border-slate-400/20 from-slate-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(100,116,139,0.1)]", filter: "all" },
            { label: "Done", value: doneCount, color: "text-green-600", variant: "border-green-400/20 from-green-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(34,197,94,0.12)]", filter: "done" },
            { label: "Pending", value: pendingCount, color: "text-yellow-600", variant: "border-yellow-400/20 from-yellow-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(234,179,8,0.12)]", filter: "pending" },
            { label: "Alert", value: alertCount, color: "text-red-600", variant: "border-red-400/20 from-red-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(225,29,72,0.12)]", filter: "alert" },
            { label: "Cancelled", value: cancelledCount, color: "text-slate-600", variant: "border-slate-400/20 from-slate-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(100,116,139,0.12)]", filter: "cancelled" },
          ] as const
        ).map(({ label, value, color, variant, filter }) => (
          <Card
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`cursor-pointer rounded-[28px] border bg-gradient-to-br backdrop-blur-sm transition-shadow hover:shadow-[0_30px_70px_rgba(2,132,199,0.18)] ${variant} ${statusFilter === filter ? "ring-2 ring-primary" : ""}`}
          >
            <CardContent className="pt-2 pb-2">
              <div className="text-xs text-muted-foreground">{label}</div>
              {/* Value slot: pulse while loading */}
              {loading ? (
                <Skeleton className="h-7 w-10 mt-1 rounded" />
              ) : (
                <div className={`text-xl font-bold ${color}`}>{value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chrome — filter and export button always static */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {loading ? "" : `${filtered.length} appointment${filtered.length !== 1 ? "s" : ""}`}
        </p>
        <Input
          placeholder="Filter appointments…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-56"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCSV(filtered)}
          disabled={loading || filtered.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table — glass card shell always visible; body rows pulse while loading */}
      <div className="rounded-[28px] border bg-gradient-to-br from-indigo-500/5 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(99,102,241,0.08)] overflow-hidden">
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
              /* Skeleton rows: Title, Status, Start, End, Category, Patient, Location, Actions */
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
                  {/* Actions column — static chrome, no pulse */}
                  <TableCell className="text-right"><div className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-10 w-10 opacity-30" />
                    <p className="font-medium">No appointments</p>
                    <p className="text-sm">Appointments will appear here.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No results.
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
        {!loading && table.getPageCount() > 1 && (
          <div className="px-4 py-2 border-t flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      {isDeleting && <p className="text-sm text-muted-foreground">Deleting…</p>}
    </div>
  );
}
