"use client";

/**
 * Doctor Management — redesigned to match PatientManagement style.
 * Color scheme: sky/indigo (different from patient's emerald).
 *
 * Shows:
 *  - Stat cards (total doctors, with specialty, with availability)
 *  - Searchable DataTable with avatar, name/email, specialty, availability days
 *  - Row actions: View detail, Edit role
 */

import { type ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  skyGlassTableFrameClass,
  emeraldGlassPrimaryButtonClass,
} from "@/lib/calendar-header-action-styles";
import type { User } from "@/types/types";
import { useUsers } from "@/hooks/useUsers";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import {
  EllipsisVertical,
  Eye,
  ShieldCheck,
  Stethoscope,
  Users,
  CalendarClock,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Types for the doctor detail data from /api/doctors
// ---------------------------------------------------------------------------
interface DoctorRow {
  id: string;
  email: string;
  display_name: string | null;
  image: string | null;
  specialty: string | null;
  bio: string | null;
  availabilities: { weekday: number }[];
  patient_count: number;
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// ---------------------------------------------------------------------------
// Stat cards — only pulse numeric values during load (icons + labels stay stable)
// ---------------------------------------------------------------------------
function DoctorStatCards({ doctors, isLoading }: { doctors: DoctorRow[]; isLoading: boolean }) {
  const withSpecialty = doctors.filter((d) => d.specialty).length;
  const withAvailability = doctors.filter((d) => d.availabilities.length > 0).length;

  const stats = [
    {
      label: "Total Doctors",
      value: doctors.length,
      icon: <Stethoscope className="h-4 w-4" />,
      cls: "bg-sky-50/60 border-sky-200/60",
      valueCls: "text-sky-700",
      iconCls: "bg-sky-100 border-sky-200 text-sky-600",
    },
    {
      label: "With Specialty",
      value: withSpecialty,
      icon: <BookOpen className="h-4 w-4" />,
      cls: "bg-indigo-50/60 border-indigo-200/60",
      valueCls: "text-indigo-700",
      iconCls: "bg-indigo-100 border-indigo-200 text-indigo-600",
    },
    {
      label: "With Availability",
      value: withAvailability,
      icon: <CalendarClock className="h-4 w-4" />,
      cls: "bg-violet-50/60 border-violet-200/60",
      valueCls: "text-violet-700",
      iconCls: "bg-violet-100 border-violet-200 text-violet-600",
    },
    {
      label: "Total Patients",
      value: doctors.reduce((s, d) => s + d.patient_count, 0),
      icon: <Users className="h-4 w-4" />,
      cls: "bg-emerald-50/60 border-emerald-200/60",
      valueCls: "text-emerald-700",
      iconCls: "bg-emerald-100 border-emerald-200 text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {stats.map(({ label, value, icon, cls, valueCls, iconCls }) => (
        <Card key={label} className={cn("rounded-[16px] border", cls)}>
          <CardContent className="p-3 flex items-center gap-2">
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl border shrink-0", iconCls)}>
              {icon}
            </span>
            <div>
              {/* Only pulse the numeric value — label + icon stay fixed during load */}
              {isLoading
                ? <Skeleton className="h-5 w-8 rounded mb-1" />
                : <p className={cn("text-lg font-bold leading-none", valueCls)}>{value}</p>
              }
              <p className="text-xs text-muted-foreground ">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role change cell
// ---------------------------------------------------------------------------
function RoleCell({ user, onRoleChange }: { user: User; onRoleChange: (id: string, role: string) => void }) {
  const ROLES = ["admin", "doctor", "patient"];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1">
          <UserRoleBadge role={user.role} />
          <ShieldCheck className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Change role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((r) => (
          <DropdownMenuItem key={r} className="capitalize" onSelect={() => onRoleChange(user.id, r)}>
            {r}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// Actions cell
// ---------------------------------------------------------------------------
function ActionsCell({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <EllipsisVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <PrefetchingLink href={`/control-panel/doctors/${user.id}`} className="flex items-center gap-2 cursor-pointer">
            <Eye className="h-4 w-4" />
            View Detail
          </PrefetchingLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function DoctorManagement() {
  const { data: usersData, isLoading: usersLoading, isError: usersError, updateUser } = useUsers({ role: "doctor", limit: 100 });
  const usersRows: User[] = usersData?.users ?? [];

  // Enrich with specialty, bio, availability, patient_count from /api/doctors
  const { data: doctorsData, isLoading: doctorsLoading, isError: doctorsError } = useQuery({
    queryKey: queryKeys.doctors.all,
    queryFn: () => apiClient<{ doctors: DoctorRow[] }>("/api/doctors"),
    staleTime: 2 * 60 * 1000,
  });
  const doctorMap = new Map((doctorsData?.doctors ?? []).map((d) => [d.id, d]));
  const isLoading = usersLoading || doctorsLoading;
  const isError = usersError || doctorsError;

  const handleRoleChange = (id: string, role: string) => {
    updateUser({ id, role });
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "display_name",
      accessorFn: (row) => `${row.display_name ?? ""} ${row.email}`.trim(),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Doctor" />,
      meta: { shellClassName: "min-w-[12rem]" },
      cell: ({ row }) => {
        const u = row.original;
        const d = doctorMap.get(u.id);
        return (
          <DoctorIdentityRow
            doctor={{
              id: u.id,
              email: u.email,
              display_name: u.display_name,
              image: u.image,
              specialty: d?.specialty ?? null,
            }}
            linkKind="admin-cp"
            size="sm"
            showEmail
            showSpecialty={false}
          />
        );
      },
    },
    {
      id: "specialty",
      header: "Specialty",
      meta: { shellClassName: "min-w-[9rem]" },
      cell: ({ row }) => {
        const d = doctorMap.get(row.original.id);
        return d?.specialty ? (
          <DoctorSpecialtyBadge specialty={d.specialty} className="text-xs" />
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    },
    {
      id: "availability",
      header: "Available Days",
      meta: { shellClassName: "min-w-[10rem]" },
      cell: ({ row }) => {
        const d = doctorMap.get(row.original.id);
        if (!d || d.availabilities.length === 0)
          return <span className="text-muted-foreground text-xs">—</span>;
        const days = Array.from(new Set(d.availabilities.map((a) => a.weekday))).sort();
        return (
          <div className="flex flex-wrap gap-1">
            {days.map((day) => (
              <Badge key={day} variant="outline" className="text-[10px] px-1.5 py-0 bg-violet-50 text-violet-700 border-violet-200">
                {WEEKDAY_SHORT[day]}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "patients",
      header: "Patients",
      meta: { shellClassName: "w-[5rem] text-center" },
      cell: ({ row }) => {
        const d = doctorMap.get(row.original.id);
        return (
          <span className="text-sm font-medium">{d?.patient_count ?? 0}</span>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      meta: { shellClassName: "min-w-[8rem] whitespace-nowrap" },
      cell: ({ row }) => <RoleCell user={row.original} onRoleChange={handleRoleChange} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      meta: { shellClassName: "w-[1%] whitespace-nowrap text-right" },
      cell: ({ row }) => <ActionsCell user={row.original} />,
    },
  ];

  const enrichedDoctors: DoctorRow[] = (doctorsData?.doctors ?? []);

  if (isError) {
    return (
      <div className="space-y-4 text-gray-700">
        <PageHeader title="Doctor Management" description="Manage doctor profiles, specialties, and availability." />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-60" />
          Failed to load doctor data. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-gray-700">
      <PageHeader
        title="Doctor Management"
        description="Manage doctor profiles, specialties, and availability."
      />

      <DoctorStatCards doctors={enrichedDoctors} isLoading={isLoading} />

      <div className={cn("rounded-2xl overflow-hidden", skyGlassTableFrameClass)}>
        <DataTable<User, unknown>
          columns={columns}
          data={usersRows}
          isLoading={isLoading}
          globalFilterFn={(row, q) => {
            const s = q.trim().toLowerCase();
            if (!s) return true;
            const u = row;
            const d = doctorMap.get(u.id);
            return (
              (u.display_name?.toLowerCase().includes(s) ?? false) ||
              u.email.toLowerCase().includes(s) ||
              (d?.specialty?.toLowerCase().includes(s) ?? false)
            );
          }}
          searchPlaceholder="Search by name, email, or specialty…"
          emptyMessage="No doctors found."
          tableClassName="min-w-[860px]"
          tableLayout="auto"
        />
      </div>
    </div>
  );
}
