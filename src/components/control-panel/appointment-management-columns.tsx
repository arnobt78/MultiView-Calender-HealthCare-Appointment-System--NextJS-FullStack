"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { AppointmentActionsMenu } from "@/components/shared/AppointmentActionsMenu";
import {
  AppointmentCategoryTableCell,
  AppointmentManagementStatusCell,
  AppointmentPatientTableCell,
  AppointmentTitleTableCell,
  AppointmentTreatingTableCell,
  AppointmentWhenTableCell,
} from "@/components/shared/appointments/appointment-table-cells";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import type { InvoiceRow } from "@/lib/billing-types";
import {
  cpClinicalListActionsColumnShellClass,
  cpClinicalListAppointmentCategoryColumnShellClass,
  cpClinicalListAppointmentPatientColumnShellClass,
  cpClinicalListAppointmentStatusColumnShellClass,
  cpClinicalListAppointmentTitleColumnShellClass,
  cpClinicalListAppointmentTreatingColumnShellClass,
  cpClinicalListAppointmentWhenColumnShellClass,
} from "@/lib/cp-clinical-list-table-classes";
import type { EntityRole } from "@/lib/entity-routes";

type DoctorLookup = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  image?: string | null;
  specialty?: string | null;
};

export type BuildAppointmentManagementColumnsOpts = {
  viewerRole: EntityRole;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  doctorById: Map<string, DoctorLookup>;
  invoiceDisplayByAppt: Map<string, InvoiceDisplayStatus>;
  invoiceByAppt: Map<string, InvoiceRow>;
  onEdit: (id: string) => void;
  onToggleStatus: (id: string, next: "done" | "pending" | "alert") => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
};

/** CP appointment list — shared DataTable column defs. */
export function buildAppointmentManagementColumns(
  opts: BuildAppointmentManagementColumnsOpts
): ColumnDef<FullAppointment>[] {
  const {
    viewerRole,
    userId,
    userEmail,
    userRole,
    doctorById,
    invoiceDisplayByAppt,
    invoiceByAppt,
    onEdit,
    onToggleStatus,
    onDelete,
    onCancel,
  } = opts;

  return [
    {
      id: "title",
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      meta: { shellClassName: cpClinicalListAppointmentTitleColumnShellClass },
      cell: ({ row }) => (
        <AppointmentTitleTableCell
          appointment={row.original}
          viewerRole={viewerRole}
        />
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      meta: { shellClassName: cpClinicalListAppointmentStatusColumnShellClass },
      cell: ({ row }) => {
        const appt = row.original;
        return (
          <AppointmentManagementStatusCell
            appointment={appt}
            invoiceDisplayStatus={invoiceDisplayByAppt.get(appt.id) ?? null}
            invoice={invoiceByAppt.get(appt.id) ?? null}
          />
        );
      },
    },
    {
      id: "when",
      accessorFn: (row) => row.start,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="When" />
      ),
      meta: { shellClassName: cpClinicalListAppointmentWhenColumnShellClass },
      cell: ({ row }) => (
        <AppointmentWhenTableCell appointment={row.original} />
      ),
    },
    {
      id: "category",
      accessorFn: (row) => row.category_data?.label ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      meta: { shellClassName: cpClinicalListAppointmentCategoryColumnShellClass },
      cell: ({ row }) => (
        <AppointmentCategoryTableCell
          appointment={row.original}
          viewerRole={viewerRole}
        />
      ),
    },
    {
      id: "patient",
      accessorFn: (row) =>
        row.patient_data
          ? `${row.patient_data.firstname ?? ""} ${row.patient_data.lastname ?? ""}`.trim()
          : "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Patient" />
      ),
      meta: { shellClassName: cpClinicalListAppointmentPatientColumnShellClass },
      cell: ({ row }) => (
        <AppointmentPatientTableCell
          appointment={row.original}
          viewerRole={viewerRole}
        />
      ),
    },
    {
      id: "treating",
      accessorFn: (row) => row.treating_physician_id ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Treating" />
      ),
      meta: { shellClassName: cpClinicalListAppointmentTreatingColumnShellClass },
      cell: ({ row }) => (
        <AppointmentTreatingTableCell
          appointment={row.original}
          viewerRole={viewerRole}
          doctorById={doctorById}
        />
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" className="text-right" />
      ),
      enableSorting: false,
      meta: { shellClassName: cpClinicalListActionsColumnShellClass },
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
            userId={userId}
            userEmail={userEmail}
            userRole={userRole}
            onToggleStatus={onToggleStatus}
            onEdit={() => onEdit(appt.id)}
            onDelete={onDelete}
            onCancel={onCancel}
            triggerClassName="h-8 w-8"
          />
        );
      },
    },
  ];
}
