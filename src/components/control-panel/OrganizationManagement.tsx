"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useOrganization, type Organization } from "@/hooks/useOrganization";
import { useUsers } from "@/hooks/useUsers";
import { CP_ALL_USERS_FILTERS } from "@/lib/control-panel-users-filters";
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
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  buildOrganizationDeleteConfirmSubtitle,
  DELETE_ORGANIZATION_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Plus, Users, Building2 } from "lucide-react";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { format } from "date-fns";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import { queryKeys } from "@/lib/query-keys";
import { OrganizationBillingPanel } from "@/components/control-panel/OrganizationBillingPanel";
import { ControlPanelEntityListShell } from "@/components/control-panel/ControlPanelEntityListShell";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Organization>();

function CreateOrgDialog({ onCreate }: { onCreate: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className={cn(emeraldGlassPrimaryButtonClass, "gap-2 cursor-pointer")}>
          <Building2 className="h-4 w-4 shrink-0" aria-hidden />
          Create Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              placeholder="e.g. HealthCal Pro Clinic"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddMemberDialog({
  org,
  onAdd,
}: {
  org: Organization;
  onAdd: (args: {
    orgId: string;
    userId: string;
    role: string;
    memberLabel?: string;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("doctor");
  const { data: usersData } = useUsers(CP_ALL_USERS_FILTERS);
  const users = usersData?.users ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    const user = users.find((u) => u.id === userId);
    onAdd({
      orgId: org.id,
      userId,
      role,
      memberLabel: user?.display_name ?? user?.email ?? "Member",
    });
    setUserId("");
    setRole("doctor");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Users className="h-4 w-4" /> Add Member
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member to {org.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2 pt-2">
          <div className="space-y-1.5">
            <Label>User</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.display_name ?? u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!userId}>Add Member</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Org row menu — delete uses shared `ConfirmActionDialog` (dropdown sibling pattern). */
function OrganizationRowActions({
  org,
  isOwner,
  onAddMember,
  onDelete,
}: {
  org: Organization;
  isOwner: boolean;
  onAddMember: (args: {
    orgId: string;
    userId: string;
    role: string;
    memberLabel?: string;
  }) => void;
  onDelete: (orgId: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <AddMemberDialog org={org} onAdd={onAddMember} />
          {isOwner ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onSelect={(e) => {
                  e.preventDefault();
                  setConfirmOpen(true);
                }}
              >
                Delete Organization
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {isOwner ? (
        <ConfirmActionDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          variant="destructive"
          title={DELETE_ORGANIZATION_CONFIRM_TITLE}
          subtitle={buildOrganizationDeleteConfirmSubtitle(org.name)}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => {
            onDelete(org.id);
            setConfirmOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  doctor: "bg-blue-100 text-blue-700",
  patient: "bg-green-100 text-green-700",
};

/**
 * OrganizationManagement — SSR seed + useCpListBodyLoading; Create in merged header actions slot.
 */

export default function OrganizationManagement() {
  const {
    organizations,
    isLoading,
    isError,
    error,
    createOrg,
    isCreating,
    addMember,
    deleteOrg,
  } = useOrganization();
  const { data: allUsersData } = useUsers(CP_ALL_USERS_FILTERS);
  const allUsers = allUsersData?.users ?? [];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const listBodyLoading = useCpListBodyLoading(queryKeys.organizations.all, isLoading);

  const columns = [
    columnHelper.accessor("name", {
      header: "Organization",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <div className="font-medium">{info.getValue()}</div>
            <div className="text-xs text-muted-foreground">{info.row.original.slug}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("role", {
      header: "Your Role",
      cell: (info) => {
        const role = info.getValue() ?? "member";
        return (
          <Badge className={ROLE_COLORS[role] ?? "bg-gray-100 text-gray-700"}>
            {role}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Created",
      cell: (info) => format(new Date(info.getValue()), "dd MMM yyyy"),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const org = row.original;
        const isOwner = org.role === "admin" || org.owner_user_id != null;
        return (
          <OrganizationRowActions
            org={org}
            isOwner={isOwner}
            onAddMember={addMember}
            onDelete={deleteOrg}
          />
        );
      },
    }),
  ];

  const table = useReactTable({
    data: organizations,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isError) {
    return <div className="p-4 text-red-500">Error: {error?.message}</div>;
  }

  return (
    <>
      <ControlPanelEntityListShell
        tone="violet"
        headerSlot={
          <ControlPanelPageChrome
            tab="organizations"
            actions={<CreateOrgDialog onCreate={createOrg} />}
            toolbar={
              <div className="flex w-full flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {listBodyLoading
                    ? ""
                    : `${organizations.length} organisation${organizations.length !== 1 ? "s" : ""}`}
                </p>
                <Input
                  placeholder="Filter organizations..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-56"
                />
              </div>
            }
          />
        }
        statsSlot={
          <>
            <PatientStatCard
              variant="sky"
              icon={Building2}
              title="Total Organisations"
              subtitle="All registered organisations"
              value={organizations.length}
              valueSkeleton={listBodyLoading}
            />
            <PatientStatCard
              variant="violet"
              icon={Users}
              title="Total Users"
              subtitle="All users across the platform"
              value={allUsers.length}
              valueSkeleton={listBodyLoading}
            />
          </>
        }
        tableSlot={
          <>
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
                        {header.column.getIsSorted() === "asc"
                          ? " ↑"
                          : header.column.getIsSorted() === "desc"
                            ? " ↓"
                            : ""}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {listBodyLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4 rounded shrink-0" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-36 rounded" />
                            <Skeleton className="h-3 w-24 rounded" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24 rounded" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : !listBodyLoading && organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Building2 className="h-10 w-10 opacity-30" />
                        <p className="font-medium">No organizations yet</p>
                        <p className="text-sm">
                          Create your first organization to manage teams and members.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8 text-muted-foreground"
                    >
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
            {!listBodyLoading && (
              <div className="px-4 py-2 border-t text-xs text-muted-foreground">
                {table.getRowModel().rows.length} of {organizations.length} organizations
              </div>
            )}
          </>
        }
        footerSlot={
          <>
            {isCreating && (
              <p className="text-sm text-muted-foreground">Creating organization…</p>
            )}
            {!listBodyLoading &&
              organizations.map((org) => (
                <OrganizationBillingPanel
                  key={org.id}
                  organizationId={org.id}
                  organizationName={org.name}
                />
              ))}
          </>
        }
      />
    </>
  );
}
