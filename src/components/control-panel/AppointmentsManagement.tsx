"use client";

import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  CalendarDays,
  MoreHorizontal,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

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
    typeof a.patient === "object" && a.patient
      ? `"${(a.patient as { firstname?: string; lastname?: string }).firstname ?? ""} ${(a.patient as { firstname?: string; lastname?: string }).lastname ?? ""}"`
      : "",
    typeof a.category === "object" && a.category
      ? `"${(a.category as { label?: string }).label ?? ""}"`
      : "",
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

const STATUS_META: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
  done: { cls: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-3 w-3" />, label: "Done" },
  pending: { cls: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3 w-3" />, label: "Pending" },
  alert: { cls: "bg-red-100 text-red-700", icon: <AlertTriangle className="h-3 w-3" />, label: "Alert" },
};

export default function AppointmentsManagement() {
  const { appointments, isLoading, isError, error, deleteAppointment, toggleStatus, isDeleting } = useAppointments();
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
      cell: (info) => {
        const s = info.getValue() ?? "pending";
        const meta = STATUS_META[s] ?? STATUS_META.pending;
        return (
          <Badge className={`gap-1 ${meta.cls}`}>
            {meta.icon} {meta.label}
          </Badge>
        );
      },
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild className="gap-2">
                <Link href={`/control-panel/appointments/${appt.id}`}>
                  <Eye className="h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() =>
                  toggleStatus({
                    id: appt.id,
                    status: appt.status === "done" ? "pending" : "done",
                  })
                }
              >
                <CheckCircle2 className="h-4 w-4" />
                {appt.status === "done" ? "Mark Pending" : "Mark Done"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 gap-2"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      <strong>{appt.title}</strong> will be permanently deleted along with its activities and assignees.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => deleteAppointment(appt.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
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

  const doneCount = appointments.filter((a) => a.status === "done").length;
  const pendingCount = appointments.filter((a) => (a.status ?? "pending") === "pending").length;
  const alertCount = appointments.filter((a) => a.status === "alert").length;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[350px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return <p className="p-4 text-red-500">Error: {error?.message}</p>;
  }

  return (
    <div className="space-y-2 animate-in fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card onClick={() => setStatusFilter("all")} className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}>
          <CardContent className="pt-3 pb-3">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setStatusFilter("done")} className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === "done" ? "ring-2 ring-primary" : ""}`}>
          <CardContent className="pt-3 pb-3">
            <div className="text-xs text-muted-foreground">Done</div>
            <div className="text-2xl font-bold text-green-600">{doneCount}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setStatusFilter("pending")} className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === "pending" ? "ring-2 ring-primary" : ""}`}>
          <CardContent className="pt-3 pb-3">
            <div className="text-xs text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setStatusFilter("alert")} className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === "alert" ? "ring-2 ring-primary" : ""}`}>
          <CardContent className="pt-3 pb-3">
            <div className="text-xs text-muted-foreground">Alert</div>
            <div className="text-2xl font-bold text-red-600">{alertCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Appointment Management
          </h2>
          <p className="text-sm text-muted-foreground">{filtered.length} appointment{filtered.length !== 1 ? "s" : ""}</p>
        </div>
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
          disabled={filtered.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
            <CardHeader className="p-0">
              <CardTitle className="text-base">No appointments</CardTitle>
            </CardHeader>
            <p className="text-sm text-muted-foreground mt-1">Appointments will appear here.</p>
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
          {table.getPageCount() > 1 && (
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
      )}
      {isDeleting && <p className="text-sm text-muted-foreground">Deleting…</p>}
    </div>
  );
}
