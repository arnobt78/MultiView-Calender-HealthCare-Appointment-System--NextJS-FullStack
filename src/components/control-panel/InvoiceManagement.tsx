"use client";

/**
 * InvoiceManagement — inline skeleton pattern:
 *   - Summary card shells, heading, filter input, "New Invoice" button, and table headers stay mounted.
 *   - Only the stat values inside summary cards and table body rows pulse as skeletons while loading.
 *   - `isMounted` + `requestAnimationFrame` guard prevents hydration flicker.
 */

import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, FileEdit, Receipt } from "lucide-react";
import { InvoiceBillingStatsRow } from "@/components/shared/billing/InvoiceBillingStatsRow";
import { CreateInvoiceDialog } from "@/components/shared/billing/CreateInvoiceDialog";
import { InvoiceAdminActionsMenu } from "@/components/shared/billing/InvoiceAdminActionsMenu";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceVisitSummaryLine } from "@/components/shared/billing/InvoiceVisitSummaryLine";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { format } from "date-fns";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";

const columnHelper = createColumnHelper<Invoice>();

export default function InvoiceManagement() {
  const {
    invoices,
    isLoading,
    isError,
    error,
    pay,
    isPaying,
    createInvoice,
    isCreating,
    deleteInvoice,
    updateInvoice,
    recordPayment,
    refundInvoice,
    isUpdating,
    isRecording,
    isRefunding,
  } = usePayments();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = [
    columnHelper.accessor("id", {
      header: "Invoice #",
      cell: (info) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{info.getValue().slice(0, 8)}
        </span>
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => (
        <div className="min-w-0 max-w-[280px]">
          <p className="truncate text-sm">
            {info.getValue() ?? <span className="text-muted-foreground italic">—</span>}
          </p>
          <InvoiceVisitSummaryLine summary={info.row.original.visit_summary} />
        </div>
      ),
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => {
        const currency = info.row.original.currency.toUpperCase();
        return (
          <span className="font-semibold">
            {(info.getValue() / 100).toLocaleString("de-DE", { style: "currency", currency })}
          </span>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <InvoiceStatusBadge invoice={info.row.original} />
      ),
    }),
    columnHelper.accessor("due_date", {
      header: "Due",
      cell: (info) =>
        info.getValue()
          ? format(new Date(info.getValue()!), "dd MMM yyyy")
          : <span className="text-muted-foreground">—</span>,
    }),
    columnHelper.accessor("created_at", {
      header: "Created",
      cell: (info) => format(new Date(info.getValue()), "dd MMM yyyy"),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const invoice = row.original;
        const busy = isUpdating || isRecording || isRefunding;
        return (
          <InvoiceAdminActionsMenu
            invoice={invoice}
            viewerRole="admin"
            onPay={pay}
            onSend={(id) => updateInvoice({ invoiceId: id, body: { status: "sent" } })}
            onMarkPaid={recordPayment}
            onCancel={(id) => updateInvoice({ invoiceId: id, body: { status: "cancelled" } })}
            onDelete={deleteInvoice}
            onRefund={refundInvoice}
            isPaying={isPaying}
            isUpdating={busy}
          />
        );
      },
    }),
  ];

  const table = useReactTable({
    data: invoices,
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
    return <div className="p-4 text-red-500">Error: {error?.message}</div>;
  }

  const draftCount = isMounted ? invoices.filter((i) => i.status === "draft").length : 0;

  return (
    <div className={controlPanelSectionRootClass}>
      {/* Page header */}
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-500" aria-hidden />
            Invoice Management
          </span>
        }
        description="Manage all patient invoices, track payments, and process billing across your organisation."
        actions={<CreateInvoiceDialog variant="admin" onCreate={createInvoice} />}
      />

      {/* KPI strip — outstanding excludes refunded/cancelled (dashboard parity). */}
      <InvoiceBillingStatsRow invoices={invoices} valueSkeleton={loading} />

      {/* Draft state card — auto-generated draft invoices awaiting review. */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <PatientStatCard
          variant="amber"
          icon={FileEdit}
          title="Draft Invoices"
          subtitle="Auto-generated, not yet sent"
          value={draftCount}
          valueSkeleton={loading}
        />
        <PatientStatCard
          variant="sky"
          icon={ClipboardList}
          title="Total Invoices"
          subtitle="All statuses combined"
          value={isMounted ? invoices.length : 0}
          valueSkeleton={loading}
        />
      </div>

      {/* Chrome — filter and table heading */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {loading ? "" : `${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Filter invoices..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-56"
          />
        </div>
      </div>

      {/* Table — glass card shell always visible; body rows pulse while loading */}
      <div className="rounded-[28px] border bg-gradient-to-br from-amber-500/5 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(245,158,11,0.08)] overflow-hidden">
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
              /* Skeleton rows: Invoice#, Description, Amount, Status, Due, Created, Actions */
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20 rounded font-mono" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                  {/* Actions column — static chrome, no pulse */}
                  <TableCell className="text-right"><div className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Receipt className="h-10 w-10 opacity-30" />
                    <p className="font-medium">No invoices yet</p>
                    <p className="text-sm">Create your first invoice to track payments.</p>
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
            {table.getRowModel().rows.length} of {invoices.length} invoices
          </div>
        )}
      </div>
      {isCreating && <p className="text-sm text-muted-foreground">Creating invoice…</p>}
    </div>
  );
}
