"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import {
  ClinicalEmptyDash,
  clinicalEmptyOrNode,
  type ClinicalEmptyLayout,
} from "@/components/shared/ClinicalTableEmptyDash";
import { clinicalHasTextValue } from "@/lib/clinical-empty-value";
import { DoctorIdentityCell } from "@/components/shared/person-display/DoctorIdentityCell";
import {
  appointmentDetailHref,
  categoryDetailHref,
  invoiceDetailHref,
} from "@/lib/entity-routes";
import {
  clinicalCellMutedTextClass,
  clinicalCellPrimaryTextClass,
  clinicalTableCellMinRowClass,
  clinicalTableCellWrapClass,
  clinicalTableColumnIdentityShellClass,
  clinicalCategoryLabelRowClass,
  clinicalCategorySwatchAnchorClass,
  clinicalTableColumnCategoryShellClass,
  clinicalTableColumnTitleShellClass,
  clinicalTableColumnWhenShellClass,
  clinicalTableColumnWrapShellClass,
} from "@/lib/table-display-styles";
import { isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { AppointmentSnapshotRow, SnapshotInvoice } from "@/types/types";
import type { EntityRole } from "@/lib/entity-routes";
import { CLINICAL_SNAPSHOT_APPOINTMENT_COL_WIDTH } from "@/lib/clinical-snapshot-table-columns";

function categorySwatchFill(color: string | null | undefined): string {
  if (!color?.trim()) return "#94a3b8";
  const hex = color.trim();
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex) ? hex : "#94a3b8";
}

/**
 * Category pill — role-aware link via `categoryDetailHref`.
 * Missing label → `ClinicalEmptyDash` via `clinicalEmptyOr` (table + patient schema row).
 */
export function CategoryTableCell({
  label,
  color,
  categoryId,
  viewerRole,
  emptyLayout = "table",
}: {
  label: string | null | undefined;
  color: string | null | undefined;
  categoryId?: string | null;
  viewerRole?: EntityRole;
  /** `definition` for patient schema `<dd>`; `table` for snapshot grids (default). */
  emptyLayout?: ClinicalEmptyLayout;
}) {
  if (!clinicalHasTextValue(label)) {
    return <ClinicalEmptyDash layout={emptyLayout} />;
  }
  const trimmed = label!.trim();
  const dot = (
    <span className={clinicalCategorySwatchAnchorClass} aria-hidden>
      <svg width="8" height="8" viewBox="0 0 8 8" className="block">
        <circle cx="4" cy="4" r="4" fill={categorySwatchFill(color)} />
      </svg>
    </span>
  );
  const canLink = categoryId && isValidUUID(categoryId);
  return (
    <span className={cn(clinicalCategoryLabelRowClass, clinicalCellPrimaryTextClass)}>
      {dot}
      {canLink ? (
        <EntityTitleLink
          href={categoryDetailHref(viewerRole, categoryId)}
          label={trimmed}
          wrapLabel
          className={cn("min-w-0 flex-1 font-normal", clinicalTableCellWrapClass)}
        />
      ) : (
        <span className={cn("min-w-0 flex-1", clinicalTableCellWrapClass)}>{trimmed}</span>
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

export type SnapshotStaffLookup = DoctorLookup;

export type BuildSnapshotColumnsOpts = {
  viewerRole: EntityRole;
  patientDisplayName: string;
  /** Doctors + admins for calendar-owner portraits (snapshot image wins when set). */
  staffById: Map<string, SnapshotStaffLookup>;
};

/** Related Appointments table — TanStack columns aligned with patient-management header/cell styles. */
export function buildRelatedAppointmentsColumns(
  opts: BuildSnapshotColumnsOpts
): ColumnDef<AppointmentSnapshotRow>[] {
  const { viewerRole, patientDisplayName, staffById } = opts;

  return [
    {
      id: "title",
      accessorFn: (row) => row.title ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      meta: {
        shellClassName: clinicalTableColumnTitleShellClass,
        colWidth: CLINICAL_SNAPSHOT_APPOINTMENT_COL_WIDTH.title,
      },
      cell: ({ row }) => {
        const a = row.original;
        const { typeLine, patientLine } = appointmentTitleLines(a, patientDisplayName);
        return (
          <div
            className={cn(
              clinicalTableCellMinRowClass,
              clinicalTableCellWrapClass,
              "flex min-w-0 flex-col justify-center gap-1"
            )}
          >
            <EntityTitleLink
              href={appointmentDetailHref(viewerRole, a.id)}
              label={typeLine}
              className={cn("block font-normal", clinicalTableCellWrapClass)}
            />
            <p className={cn(clinicalCellMutedTextClass, clinicalTableCellWrapClass)}>{patientLine}</p>
            <AppointmentStatusBadge status={a.status} />
          </div>
        );
      },
    },
    {
      id: "when",
      accessorFn: (row) => row.start ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="When" />,
      meta: {
        shellClassName: clinicalTableColumnWhenShellClass,
        colWidth: CLINICAL_SNAPSHOT_APPOINTMENT_COL_WIDTH.when,
      },
      cell: ({ row }) => {
        const a = row.original;
        return clinicalEmptyOrNode(
          Boolean(a.start),
          () => (
            <div
              className={cn(
                "min-w-0 whitespace-nowrap",
                clinicalTableCellMinRowClass,
                "flex flex-col justify-center"
              )}
            >
              <p className={clinicalCellPrimaryTextClass}>{format(new Date(a.start!), "PP")}</p>
              <p className={clinicalCellMutedTextClass}>
                {format(new Date(a.start!), "p")}
                {a.end ? ` – ${format(new Date(a.end), "p")}` : ""}
              </p>
            </div>
          ),
          "table"
        );
      },
    },
    {
      id: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      meta: {
        shellClassName: clinicalTableColumnCategoryShellClass,
        colWidth: CLINICAL_SNAPSHOT_APPOINTMENT_COL_WIDTH.category,
      },
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "w-full max-w-full overflow-hidden py-0.5")}>
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
      meta: {
        shellClassName: clinicalTableColumnIdentityShellClass,
        colWidth: CLINICAL_SNAPSHOT_APPOINTMENT_COL_WIDTH.identity,
      },
      cell: ({ row }) => {
        const a = row.original;
        return clinicalEmptyOrNode(
          Boolean(a.calendar_owner_id && a.calendar_owner_display),
          () => (
            <DoctorIdentityCell
              doctorId={a.calendar_owner_id!}
              name={a.calendar_owner_display!}
              email={a.calendar_owner_email}
              image={a.calendar_owner_image}
              specialty={null}
              viewerRole={viewerRole}
              doctorById={staffById}
              showSpecialty={false}
            />
          ),
          "table"
        );
      },
    },
    {
      id: "treating_physician",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Treating Physician" />,
      meta: {
        shellClassName: clinicalTableColumnIdentityShellClass,
        colWidth: CLINICAL_SNAPSHOT_APPOINTMENT_COL_WIDTH.identity,
      },
      cell: ({ row }) => {
        const a = row.original;
        return clinicalEmptyOrNode(
          Boolean(a.doctor_id && a.doctor_display),
          () => (
            <DoctorIdentityCell
              doctorId={a.doctor_id!}
              name={a.doctor_display!}
              email={a.doctor_email}
              image={a.doctor_image}
              specialty={a.doctor_specialty ?? staffById.get(a.doctor_id!)?.specialty ?? null}
              viewerRole={viewerRole}
              doctorById={staffById}
            />
          ),
          "table"
        );
      },
    },
    {
      id: "location",
      accessorKey: "location",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
      meta: {
        shellClassName: clinicalTableColumnWrapShellClass,
        colWidth: CLINICAL_SNAPSHOT_APPOINTMENT_COL_WIDTH.location,
      },
      cell: ({ row }) =>
        clinicalEmptyOrNode(
          clinicalHasTextValue(row.original.location),
          () => (
            <p
              className={cn(
                clinicalTableCellMinRowClass,
                clinicalTableCellWrapClass,
                clinicalCellPrimaryTextClass,
                "m-0 w-full max-w-full overflow-hidden whitespace-normal"
              )}
            >
              {row.original.location!.trim()}
            </p>
          ),
          "table"
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
      meta: { shellClassName: clinicalTableColumnWrapShellClass },
      cell: ({ row }) =>
        clinicalEmptyOrNode(
          clinicalHasTextValue(row.original.description),
          () => (
            <div
              className={cn(
                clinicalTableCellMinRowClass,
                clinicalTableCellWrapClass,
                clinicalCellPrimaryTextClass,
                "flex min-w-0 items-start"
              )}
            >
              {row.original.description!.trim()}
            </div>
          ),
          "table"
        ),
    },
    {
      id: "appointment",
      accessorKey: "appointment_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Appointment" />,
      cell: ({ row }) => {
        const inv = row.original;
        return clinicalEmptyOrNode(
          Boolean(inv.appointment_id),
          () => (
            <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
              <EntityTitleLink
                href={appointmentDetailHref(viewerRole, inv.appointment_id!)}
                label="View"
                className="text-xs font-normal"
              />
            </div>
          ),
          "table"
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
      cell: ({ row }) =>
        clinicalEmptyOrNode(
          Boolean(row.original.due_date),
          () => (
            <div
              className={cn(
                clinicalTableCellMinRowClass,
                "flex items-center whitespace-nowrap",
                clinicalCellPrimaryTextClass
              )}
            >
              {format(new Date(row.original.due_date!), "PP")}
            </div>
          ),
          "table"
        ),
    },
    {
      id: "paid_at",
      accessorKey: "paid_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Paid" />,
      meta: { shellClassName: "whitespace-nowrap" },
      cell: ({ row }) =>
        clinicalEmptyOrNode(
          Boolean(row.original.paid_at),
          () => (
            <div
              className={cn(
                clinicalTableCellMinRowClass,
                "flex items-center whitespace-nowrap",
                clinicalCellPrimaryTextClass
              )}
            >
              {format(new Date(row.original.paid_at!), "PP")}
            </div>
          ),
          "table"
        ),
    },
  ];
}
