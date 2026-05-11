"use client";

/**
 * Relative Management — redesigned to match PatientManagement style.
 * Color scheme: teal/cyan — distinct from other management pages.
 *
 * New schema fields displayed: relationship, phone, email, date_of_birth, is_emergency_contact
 */

import { type ColumnDef } from "@tanstack/react-table";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { useRelatives, type RelativeCreateInput } from "@/hooks/useRelatives";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Relative } from "@/types/types";
import { cn } from "@/lib/utils";
import {
  skyGlassTableFrameClass,
  emeraldGlassPrimaryButtonClass,
} from "@/lib/calendar-header-action-styles";
import {
  AlertCircle,
  Heart,
  Mail,
  Phone,
  Plus,
  MoreHorizontal,
  Trash2,
  Eye,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Stat cards — teal/cyan color scheme
// ---------------------------------------------------------------------------
function RelativeStatCards({ relatives }: { relatives: Relative[] }) {
  const emergency = relatives.filter((r) => r.is_emergency_contact).length;
  const withEmail = relatives.filter((r) => r.email).length;
  const withPhone = relatives.filter((r) => r.phone).length;

  const stats = [
    {
      label: "Total Relatives",
      value: relatives.length,
      icon: <Users className="h-4 w-4" />,
      cls: "bg-teal-50/60 border-teal-200/60",
      valueCls: "text-teal-700",
      iconCls: "bg-teal-100 border-teal-200 text-teal-600",
    },
    {
      label: "Emergency Contacts",
      value: emergency,
      icon: <AlertCircle className="h-4 w-4" />,
      cls: "bg-red-50/60 border-red-200/60",
      valueCls: "text-red-700",
      iconCls: "bg-red-100 border-red-200 text-red-600",
    },
    {
      label: "With Email",
      value: withEmail,
      icon: <Mail className="h-4 w-4" />,
      cls: "bg-sky-50/60 border-sky-200/60",
      valueCls: "text-sky-700",
      iconCls: "bg-sky-100 border-sky-200 text-sky-600",
    },
    {
      label: "With Phone",
      value: withPhone,
      icon: <Phone className="h-4 w-4" />,
      cls: "bg-violet-50/60 border-violet-200/60",
      valueCls: "text-violet-700",
      iconCls: "bg-violet-100 border-violet-200 text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon, cls, valueCls, iconCls }) => (
        <Card key={label} className={cn("rounded-[16px] border", cls)}>
          <CardContent className="p-3 flex items-center gap-3">
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl border shrink-0", iconCls)}>
              {icon}
            </span>
            <div>
              <p className={cn("text-lg font-bold leading-none", valueCls)}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Actions cell
// ---------------------------------------------------------------------------
function RelativeActions({
  relative,
  onDelete,
}: {
  relative: Relative;
  onDelete: (id: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <PrefetchingLink href={`/control-panel/relatives/${relative.id}`} className="flex items-center gap-2 cursor-pointer">
              <Eye className="h-4 w-4" /> View Detail
            </PrefetchingLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive flex items-center gap-2"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete relative?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{relative.firstname} {relative.lastname}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { onDelete(relative.id); setConfirmOpen(false); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const EMPTY_FORM: RelativeCreateInput = {
  firstname: "",
  lastname: "",
  pronoun: "",
  notes: "",
  relationship: "",
  phone: "",
  email: "",
  date_of_birth: "",
  is_emergency_contact: false,
};

export default function RelativesManagement() {
  const { relatives, isLoading, isError, error, createRelative, isCreating, deleteRelative } = useRelatives();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<RelativeCreateInput>(EMPTY_FORM);

  function openCreate() {
    setForm(EMPTY_FORM);
    setCreateOpen(true);
  }

  function handleCreateSubmit() {
    if (!form.firstname.trim() || !form.lastname.trim()) return;
    createRelative(form, { onSuccess: () => setCreateOpen(false) });
  }

  const columns: ColumnDef<Relative>[] = [
    {
      id: "name",
      accessorFn: (r) => `${r.firstname} ${r.lastname}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      meta: { shellClassName: "min-w-[10rem]" },
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 border border-teal-200 text-teal-700 font-bold text-xs">
              {r.firstname[0]}{r.lastname[0]}
            </div>
            <div>
              <EntityTitleLink href={`/control-panel/relatives/${r.id}`} label={`${r.firstname} ${r.lastname}`} className="font-medium text-sm" />
              {r.pronoun && <p className="text-[10px] text-muted-foreground">{r.pronoun}</p>}
            </div>
          </div>
        );
      },
    },
    {
      id: "relationship",
      header: "Relationship",
      meta: { shellClassName: "min-w-[8rem]" },
      cell: ({ row }) => {
        const r = row.original;
        return r.relationship ? (
          <Badge variant="outline" className="text-[10px] py-0 bg-teal-50 text-teal-700 border-teal-200">
            <Heart className="h-2.5 w-2.5 mr-0.5" />
            {r.relationship}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      id: "contact",
      header: "Contact",
      meta: { shellClassName: "min-w-[10rem]" },
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="space-y-0.5">
            {r.email && (
              <p className="text-xs flex items-center gap-1 text-muted-foreground">
                <Mail className="h-3 w-3" /> {r.email}
              </p>
            )}
            {r.phone && (
              <p className="text-xs flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3 w-3" /> {r.phone}
              </p>
            )}
            {!r.email && !r.phone && <span className="text-xs text-muted-foreground">—</span>}
          </div>
        );
      },
    },
    {
      id: "emergency",
      header: "Emergency",
      meta: { shellClassName: "w-[7rem] text-center" },
      cell: ({ row }) => {
        return row.original.is_emergency_contact ? (
          <Badge variant="outline" className="text-[10px] py-0 bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
            Yes
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      meta: { shellClassName: "min-w-[10rem]" },
      cell: ({ row }) =>
        row.original.notes ? (
          <span className="text-xs text-muted-foreground max-w-[200px] truncate block">{row.original.notes}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      meta: { shellClassName: "w-[1%] whitespace-nowrap text-right" },
      cell: ({ row }) => <RelativeActions relative={row.original} onDelete={(id) => deleteRelative(id)} />,
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in">
      <PageHeader
        title="Relative Management"
        description="Manage patient relatives and emergency contacts."
        actions={
          <button type="button" onClick={openCreate} className={emeraldGlassPrimaryButtonClass}>
            <Plus className="h-4 w-4" /> Add Relative
          </button>
        }
      />

      {isError && (
        <p className="text-sm text-red-600" role="alert">
          Error: {error?.message ?? "Failed to load relatives"}
        </p>
      )}

      <RelativeStatCards relatives={relatives} />

      <div className={cn("rounded-2xl overflow-hidden", skyGlassTableFrameClass)}>
        <DataTable
          columns={columns}
          data={relatives}
          isLoading={isLoading}
          globalFilterFn={(row, q) => {
            const s = q.trim().toLowerCase();
            if (!s) return true;
            const r = row;
            return `${r.firstname} ${r.lastname} ${r.email ?? ""} ${r.phone ?? ""} ${r.relationship ?? ""}`.toLowerCase().includes(s);
          }}
          searchPlaceholder="Search by name, email, phone, or relationship…"
          emptyMessage="No relatives found."
          tableClassName="min-w-[800px]"
          tableLayout="auto"
        />
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Relative</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rel-fn">First Name *</Label>
                <Input id="rel-fn" value={form.firstname} onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))} placeholder="Jane" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rel-ln">Last Name *</Label>
                <Input id="rel-ln" value={form.lastname} onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))} placeholder="Doe" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rel-relationship">Relationship</Label>
                <Input id="rel-relationship" value={form.relationship ?? ""} onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))} placeholder="Mother, Spouse…" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rel-pronoun">Pronoun</Label>
                <Input id="rel-pronoun" value={form.pronoun ?? ""} onChange={(e) => setForm((f) => ({ ...f, pronoun: e.target.value }))} placeholder="they/them" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rel-email">Email</Label>
                <Input id="rel-email" type="email" value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rel-phone">Phone</Label>
                <Input id="rel-phone" type="tel" value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 555 000 0000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rel-dob">Date of Birth</Label>
                <Input id="rel-dob" type="date" value={form.date_of_birth ?? ""} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} />
              </div>
              <div className="flex items-end gap-2 pb-0.5">
                <input
                  id="rel-emergency"
                  type="checkbox"
                  checked={Boolean(form.is_emergency_contact)}
                  onChange={(e) => setForm((f) => ({ ...f, is_emergency_contact: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="rel-emergency" className="cursor-pointer">Emergency Contact</Label>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rel-notes">Notes</Label>
              <Textarea id="rel-notes" value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Additional notes…" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSubmit} disabled={isCreating || !form.firstname.trim() || !form.lastname.trim()}>
              {isCreating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
