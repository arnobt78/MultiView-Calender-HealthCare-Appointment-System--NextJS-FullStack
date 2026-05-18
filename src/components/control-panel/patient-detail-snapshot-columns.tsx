"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { DoctorIdentityCell } from "@/components/shared/person-display/DoctorIdentityCell";
import {
  appointmentDetailHref,
  categoryDetailHref,
  doctorDetailHref,
  invoiceDetailHref,
} from "@/lib/entity-routes";
import {
  clinicalCellMutedTextClass,
  clinicalCellPrimaryTextClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import { isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type {
  AppointmentSnapshotRow,
  Patient,
  SnapshotInvoice,
} from "@/types/types";
import type { EntityRole } from "@/lib/entity-routes";

function categorySwatchFill(color: string | null | undefined): string {
  if (!color?.trim()) return "#94a3b8";
  const hex = color.trim();
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex) ? hex : "#94a3b8";
}

/** Category pill — role-aware link via `categoryDetailHref`. */
export function CategoryTableCell({
  label,
  color,
  categoryId,
  viewerRole,
}: {
  label: string | null | undefined;
  color: string | null | undefined;
  categoryId?: string | null;
  viewerRole?: EntityRole;
}) {
  if (!label?.trim()) {
    return <span className={clinicalCellMutedTextClass}>—</span>;
  }
  const dot = (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden className="inline-block shrink-0">
      <circle cx="4" cy="4" r="4" fill={categorySwatchFill(color)} />
    </svg>
  );
  const canLink = categoryId && isValidUUID(categoryId);
  return (
    <span className={cn("inline-flex max-w-full min-w-0 items-center gap-1.5", clinicalCellPrimaryTextClass)}>
      {dot}
      {canLink ? (
        <EntityTitleLink
          href={categoryDetailHref(viewerRole, categoryId)}
          label={label.trim()}
          className="truncate font-normal"
        />
      ) : (
        <span className="truncate">{label}</span>
      )}
    </span>
  );
}

function AppointmentStatusBadge({ status }: { status?: string | null }) {
  const cls =
    status === "done"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "alert"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : status === "pending"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-slate-50 text-gray-600";
  return (
    <Badge variant="outline" className={`capitalize text-xs ${cls}`}>
      {status ?? "pending"}
    </Badge>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const cls =
    status === "paid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "overdue"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : status === "sent"
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : status === "cancelled"
            ? "border-slate-200 bg-slate-50 text-gray-400 line-through"
            : "border-slate-200 bg-slate-50 text-gray-600";
  return (
    <Badge variant="outline" className={`capitalize text-xs ${cls}`}>
      {status}
    </Badge>
  );
}

function appointmentTitleLines(
  appt: AppointmentSnapshotRow,
  patientDisplayName: string
): { typeLine: string; patientLine: string } {
  const typeFromFk = appt.appointment_type_name?.trim();
  if (typeFromFk) {
    return { typeLine: typeFromFk, patientLine: patientDisplayName };
  }
  const title = appt.title?.trim() ?? "";
  const sep = " — ";
  const idx = title.indexOf(sep);
  if (idx >= 0) {
    return {
      typeLine: title.slice(0, idx).trim() || title || "—",
      patientLine: title.slice(idx + sep.length).trim() || patientDisplayName,
    };
  }
  return { typeLine: title || "—", patientLine: patientDisplayName };
}

type DoctorLookup = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  image?: string | null;
  specialty?: string | null;
};

export type BuildSnapshotColumnsOpts = {
  viewerRole: EntityRole;
  patientDisplayName: string;
  primaryPatient?: Patient | null;
  doctorById: Map<string, DoctorLookup>;
};

/** Related Appointments table — TanStack columns aligned with patient-management header/cell styles. */
export function buildRelatedAppointmentsColumns(
  opts: BuildSnapshotColumnsOpts
): ColumnDef<AppointmentSnapshotRow>[] {
  const { viewerRole, patientDisplayName, primaryPatient, doctorById } = opts;

  return [
    {
      id: "title",
      accessorFn: (row) => row.title ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => {
        const a = row.original;
        const { typeLine, patientLine } = appointmentTitleLines(a, patientDisplayName);
        return (
          <div className={cn("min-w-0", clinicalTableCellMinRowClass, "flex flex-col justify-center")}>
            <EntityTitleLink
              href={appointmentDetailHref(viewerRole, a.id)}
              label={typeLine}
              className="block truncate font-normal"
            />
            <p className={cn("truncate", clinicalCellMutedTextClass)}>{patientLine}</p>
          </div>
        );
      },
    },
    {
      id: "when",
      accessorFn: (row) => row.start ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="When" />,
      meta: { shellClassName: "whitespace-nowrap" },
      cell: ({ row }) => {
        const a = row.original;
        if (!a.start) {
          return <span className={clinicalCellMutedTextClass}>—</span>;
        }
        return (
          <div className={cn("min-w-0 whitespace-nowrap", clinicalTableCellMinRowClass, "flex flex-col justify-center")}>
            <p className={clinicalCellPrimaryTextClass}>{format(new Date(a.start), "PP")}</p>
            <p className={clinicalCellMutedTextClass}>
              {format(new Date(a.start), "p")}
              {a.end ? ` – ${format(new Date(a.end), "p")}` : ""}
            </p>
          </div>
        );
      },
    },
    {
      id: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
          <CategoryTableCell
            label={row.original.category_label}
            color={row.original.category_color}
            categoryId={row.original.category}
            viewerRole={viewerRole}
          />
        </div>
      ),
    },
    {
      id: "calendar_owner",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Calendar Owner" />,
      cell: ({ row }) => {
        const a = row.original;
        if (!a.calendar_owner_id || !a.calendar_owner_display) {
          return <span className={clinicalCellMutedTextClass}>—</span>;
        }
        return (
          <DoctorIdentityCell
            doctorId={a.calendar_owner_id}
            name={a.calendar_owner_display}
            email={a.calendar_owner_email}
            specialty={null}
            viewerRole={viewerRole}
            doctorById={doctorById}
            showSpecialty={false}
          />
        );
      },
    },
    {
      id: "treating_physician",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Treating Physician" />,
      cell: ({ row }) => {
        const a = row.original;
        if (!a.doctor_id || !a.doctor_display) {
          return <span className={clinicalCellMutedTextClass}>—</span>;
        }
        const primaryFooter =
          primaryPatient?.primary_doctor_id &&
          a.doctor_id &&
          primaryPatient.primary_doctor_id !== a.doctor_id &&
          primaryPatient.primary_doctor_display?.trim() ? (
            <p className="mt-1.5 text-[10px] leading-snug text-gray-600">
              Primary care:{" "}
              <EntityTitleLink
                href={doctorDetailHref(viewerRole, primaryPatient.primary_doctor_id)}
                label={primaryPatient.primary_doctor_display.trim()}
                className="font-normal"
              />
            </p>
          ) : null;
        return (
          <DoctorIdentityCell
            doctorId={a.doctor_id}
            name={a.doctor_display}
            email={a.doctor_email}
            specialty={a.doctor_specialty ?? doctorById.get(a.doctor_id)?.specialty ?? null}
            viewerRole={viewerRole}
            doctorById={doctorById}
            footer={primaryFooter}
          />
        );
      },
    },
    {
      id: "location",
      accessorKey: "location",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "flex items-center", clinicalCellPrimaryTextClass)}>
          {row.original.location ?? "—"}
        </div>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
          <AppointmentStatusBadge status={row.original.status} />
        </div>
      ),
    },
  ];
}

/** Invoices linked to patient appointments — same clinical table chrome as management lists. */
export function buildPatientInvoicesColumns(viewerRole: EntityRole): ColumnDef<SnapshotInvoice>[] {
  return [
    {
      id: "amount",
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => {
        const inv = row.original;
        const label = `${(inv.amount / 100).toFixed(2)} ${inv.currency.toUpperCase()}`;
        return (
          <div className={cn(clinicalTableCellMinRowClass, "flex items-center tabular-nums", clinicalCellPrimaryTextClass)}>
            {isAdminRole(viewerRole) ? (
              <EntityTitleLink href={invoiceDetailHref(viewerRole, inv.id)} label={label} className="font-normal" />
            ) : (
              <span>{label}</span>
            )}
          </div>
        );
      },
    },
    {
      id: "description",
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => (
        <div
          className={cn(
            clinicalTableCellMinRowClass,
            "flex max-w-[160px] items-center truncate",
            clinicalCellPrimaryTextClass
          )}
        >
          {row.original.description ?? "—"}
        </div>
      ),
    },
    {
      id: "appointment",
      accessorKey: "appointment_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Appointment" />,
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
            {inv.appointment_id ? (
              <EntityTitleLink
                href={appointmentDetailHref(viewerRole, inv.appointment_id)}
                label="View"
                className="text-xs font-normal"
              />
            ) : (
              <span className={clinicalCellMutedTextClass}>—</span>
            )}
          </div>
        );
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
          <InvoiceStatusBadge status={row.original.status} />
        </div>
      ),
    },
    {
      id: "due_date",
      accessorKey: "due_date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Due" />,
      meta: { shellClassName: "whitespace-nowrap" },
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "flex items-center whitespace-nowrap", clinicalCellPrimaryTextClass)}>
          {row.original.due_date ? format(new Date(row.original.due_date), "PP") : "—"}
        </div>
      ),
    },
    {
      id: "paid_at",
      accessorKey: "paid_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Paid" />,
      meta: { shellClassName: "whitespace-nowrap" },
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "flex items-center whitespace-nowrap", clinicalCellPrimaryTextClass)}>
          {row.original.paid_at ? format(new Date(row.original.paid_at), "PP") : "—"}
        </div>
      ),
    },
  ];
}
