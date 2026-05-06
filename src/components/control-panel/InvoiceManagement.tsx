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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Plus, Receipt, CreditCard } from "lucide-react";
import { format } from "date-fns";

const columnHelper = createColumnHelper<Invoice>();

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-yellow-100 text-yellow-700",
};

function CreateInvoiceDialog({
  onCreate,
}: {
  onCreate: (body: { amount: number; description?: string; due_date?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    onCreate({
      amount: parsed,
      description: description || undefined,
      due_date: dueDate || undefined,
    });
    setAmount("");
    setDescription("");
    setDueDate("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="inv-amount">Amount (EUR)</Label>
            <Input
              id="inv-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 150.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-desc">Description</Label>
            <Textarea
              id="inv-desc"
              placeholder="Optional description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-due">Due Date</Label>
            <Input
              id="inv-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!amount || parseFloat(amount) <= 0}>
              Create Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
      cell: (info) => info.getValue() ?? <span className="text-muted-foreground italic">—</span>,
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
      cell: (info) => {
        const status = info.getValue();
        return (
          <Badge className={STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"}>
            {status}
          </Badge>
        );
      },
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
        const canPay = invoice.status === "draft" || invoice.status === "sent";
        const canDelete = invoice.status !== "paid";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canPay && (
                <DropdownMenuItem
                  onClick={() => pay(invoice.id)}
                  disabled={isPaying}
                  className="gap-2"
                >
                  <CreditCard className="h-4 w-4" /> Pay Now
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        Delete Invoice
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete invoice{" "}
                          <strong>#{invoice.id.slice(0, 8)}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => deleteInvoice(invoice.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const totalOutstanding = invoices
    .filter((i) => i.status !== "paid" && i.status !== "cancelled")
    .reduce((sum, i) => sum + i.amount, 0);

  if (isError) {
    return <div className="p-4 text-red-500">Error: {error?.message}</div>;
  }

  return (
    <div className="space-y-2 pb-3">
      {/* Summary cards — shells always visible; value slots pulse while loading */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-[28px] border bg-gradient-to-br from-green-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(34,197,94,0.12)]">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide mb-1">
              <Receipt className="h-3.5 w-3.5" /> Total Paid
            </div>
            {loading ? (
              <Skeleton className="h-7 w-28 rounded" />
            ) : (
              <div className="text-xl font-bold text-green-600">
                {(totalPaid / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border bg-gradient-to-br from-orange-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(249,115,22,0.12)]">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide mb-1">
              <CreditCard className="h-3.5 w-3.5" /> Outstanding
            </div>
            {loading ? (
              <Skeleton className="h-7 w-28 rounded" />
            ) : (
              <div className="text-xl font-bold text-orange-600">
                {(totalOutstanding / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chrome — heading, filter, and add button always static */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-500" />
            Invoice Management
          </h2>
          {loading ? (
            <Skeleton className="h-4 w-28 mt-1 rounded" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Filter invoices..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-56"
          />
          <CreateInvoiceDialog onCreate={createInvoice} />
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
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
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
