"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceVisitSummaryLine } from "@/components/shared/billing/InvoiceVisitSummaryLine";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { ClinicalAppointmentStatusBadge } from "@/components/shared/entity-detail/ClinicalAppointmentStatusBadge";
import {
  ClinicalEmptyDash,
  clinicalEmptyOrNode,
  type ClinicalEmptyLayout,
} from "@/components/shared/ClinicalTableEmptyDash";
import { clinicalHasTextValue } from "@/lib/clinical-empty-value";
import { DoctorIdentityCell } from "@/components/shared/person-display/DoctorIdentityCell";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import {
  appointmentDetailHref,
  categoryDetailHref,
  invoiceDetailHref,
  patientDetailHref,
} from "@/lib/entity-routes";
import {
  clinicalCellMutedTextClass,
  clinicalCellPrimaryTextClass,
  clinicalTableCellMinRowClass,
  clinicalTableCellWrapClass,
  clinicalTableColumnIdentityShellClass,
  clinicalCategoryLabelRowClass,
  clinicalCategorySwatchAnchorClass,
  clinicalCategoryBrandRowClass,
  clinicalTableBrandMarkCellClass,
  clinicalBadgeInlineClass,
  clinicalBadgeInlineIconClass,
  clinicalTableColumnCategoryShellClass,
  clinicalTableColumnTitleShellClass,
  clinicalTableColumnWhenShellClass,
  clinicalTableColumnWrapShellClass,
} from "@/lib/table-display-styles";
import { isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";
import { cn } from "@/lib/utils";
import type { AppointmentSnapshotRow, SnapshotInvoice } from "@/types/types";
import type { EntityRole } from "@/lib/entity-routes";
import { CLINICAL_SNAPSHOT_APPOINTMENT_COL_WIDTH } from "@/lib/clinical-snapshot-table-columns";
import type { RelatedAppointmentsColumnId } from "@/lib/clinical-snapshot-table-columns";
import {
  resolveCalendarOwnerLinkKind,
  resolveCategoryLinkEnabled,
  resolveTreatingPhysicianLinkKind,
  type RelatedAppointmentsLinkPolicy,
} from "@/lib/entity-detail-snapshot-links";

/**
 * Category pill — role-aware link via `categoryDetailHref`.
 * Missing label → `ClinicalEmptyDash` via `clinicalEmptyOr` (table + patient schema row).
 */
export function CategoryTableCell({
  label,
  color,
  icon,
  categoryId,
  viewerRole,
  emptyLayout = "table",
  markVariant = "dot",
  markSize = "list",
  linkEnabled = true,
}: {
  label: string | null | undefined;
  color: string | null | undefined;
  icon?: string | null;
  categoryId?: string | null;
  viewerRole?: EntityRole;
  /** Portal doctor detail passes `false` via snapshot link policy. */
  linkEnabled?: boolean;
  /** `definition` for patient schema `<dd>`; `table` for snapshot grids (default). */
  emptyLayout?: ClinicalEmptyLayout;
  /** `brand` = logo tile; `dot` = compact swatch. */
  markVariant?: "brand" | "dot";
  /** Passed to `CategoryBrandMark` when `markVariant="brand"`. */
  markSize?: "list" | "compact";
}) {
  if (!clinicalHasTextValue(label)) {
    return <ClinicalEmptyDash layout={emptyLayout} />;
  }
  const trimmed = label!.trim();
  const mark =
    markVariant === "brand" ? (
      <CategoryBrandMark color={color} icon={icon} variant="brand" size={markSize} />
    ) : (
      <span className={clinicalCategorySwatchAnchorClass} aria-hidden>
        <CategoryBrandMark color={color} icon={icon} variant="dot" />
      </span>
    );
  const canLink = linkEnabled && categoryId && isValidUUID(categoryId);
  return (
    <span
      className={cn(
        markVariant === "brand" ? clinicalCategoryBrandRowClass : clinicalCategoryLabelRowClass,
        clinicalCellPrimaryTextClass,
        markVariant === "brand" && markSize === "list" && "gap-2"
      )}
    >
      {mark}
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

function resolvePatientIdentityFromRow(
  appt: AppointmentSnapshotRow,
  viewerRole: EntityRole,
  fallbackName: string,
  pagePatient?: BuildSnapshotColumnsOpts["pagePatient"]
) {
  const patientId = appt.patient;
  if (!patientId || !isValidUUID(patientId)) return null;
  let first = appt.patient_firstname?.trim() ?? "";
  let last = appt.patient_lastname?.trim() ?? "";
  let email = appt.patient_email ?? null;
  let birth_date = appt.patient_birth_date ?? null;
  let clinical_profile = appt.patient_clinical_profile ?? null;
  if (!first && !last && pagePatient?.id === patientId) {
    first = pagePatient.firstname?.trim() ?? "";
    last = pagePatient.lastname?.trim() ?? "";
    email = pagePatient.email;
    birth_date = pagePatient.birth_date;
    clinical_profile = pagePatient.clinical_profile ?? null;
  }
  const name = `${first} ${last}`.trim() || fallbackName;
  return {
    href: patientDetailHref(viewerRole, patientId),
    name,
    email,
    patient: {
      id: patientId,
      firstname: first,
      lastname: last,
      email: email ?? "",
      birth_date,
      clinical_profile,
    },
  };
}

type DoctorLookup = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  image?: string | null;
  specialty?: string | null;
};

export type SnapshotStaffLookup = DoctorLookup;

/** Title column cell — toggle patient identity + status per entity detail context. */
export type RelatedAppointmentsTitleColumnDisplay = {
  /** Avatar, name, email under title. Default true; false on patient detail (page already scoped). */
  showPatientIdentity?: boolean;
  /** Status badge under title stack. Default true. */
  showStatus?: boolean;
};

export type BuildSnapshotColumnsOpts = {
  viewerRole: EntityRole;
  patientDisplayName: string;
  /** Doctors + admins for calendar-owner portraits (snapshot image wins when set). */
  staffById: Map<string, SnapshotStaffLookup>;
  /** Patient detail page — fills portrait/name when row omits denormalized patient fields. */
  pagePatient?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string | null;
    birth_date: string | null;
    clinical_profile?: AppointmentSnapshotRow["patient_clinical_profile"];
  } | null;
  /** Omit columns by id — category detail hides `category` (page is already scoped to one category). */
  hiddenColumns?: readonly RelatedAppointmentsColumnId[];
  /** Related Appointments title column layout — reuse on patient/category/portal detail tables. */
  titleColumn?: RelatedAppointmentsTitleColumnDisplay;
  /** Portal doctor/category detail — disables links that would 404 for patient/doctor viewers. */
  linkPolicy?: RelatedAppointmentsLinkPolicy;
};

export type { RelatedAppointmentsColumnId };

/** Related Appointments table — TanStack columns aligned with patient-management header/cell styles. */
export function buildRelatedAppointmentsColumns(
  opts: BuildSnapshotColumnsOpts
): ColumnDef<AppointmentSnapshotRow>[] {
  const { viewerRole, patientDisplayName, staffById, pagePatient, hiddenColumns, titleColumn, linkPolicy } =
    opts;
  const hidden = new Set(hiddenColumns ?? []);
  const showPatientIdentity = titleColumn?.showPatientIdentity ?? true;
  const showStatus = titleColumn?.showStatus ?? true;
  const linkAppointmentTitle = linkPolicy?.appointmentTitle ?? true;
  const linkPatientInTitle = linkPolicy?.patientInTitle ?? true;

  const columns: ColumnDef<AppointmentSnapshotRow>[] = [
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
        const patientIdentity = showPatientIdentity
          ? resolvePatientIdentityFromRow(a, viewerRole, patientLine, pagePatient)
          : null;
        return (
          <div
            className={cn(
              clinicalTableCellMinRowClass,
              clinicalTableCellWrapClass,
              "flex min-w-0 flex-col justify-center gap-1"
            )}
          >
            {linkAppointmentTitle ? (
              <EntityTitleLink
                href={appointmentDetailHref(viewerRole, a.id)}
                label={typeLine}
                className={cn("block font-normal", clinicalTableCellWrapClass)}
              />
            ) : (
              <span
                className={cn(
                  "block font-normal text-foreground",
                  clinicalTableCellWrapClass
                )}
              >
                {typeLine}
              </span>
            )}
            {showPatientIdentity ? (
              patientIdentity ? (
                <PatientIdentityCell
                  href={patientIdentity.href}
                  linkPatient={linkPatientInTitle}
                  name={patientIdentity.name}
                  email={patientIdentity.email}
                  patient={patientIdentity.patient}
                  avatarSizeClassName="h-7 w-7"
                  className="min-h-0 items-start gap-1.5 py-0"
                />
              ) : (
                <p className={cn(clinicalCellMutedTextClass, clinicalTableCellWrapClass)}>{patientLine}</p>
              )
            ) : null}
            {showStatus ? <ClinicalAppointmentStatusBadge status={a.status} /> : null}
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
              <p className={clinicalCellMutedTextClass}>{format(new Date(a.start!), "PP")}</p>
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
        <div className={cn(clinicalTableCellMinRowClass, clinicalTableBrandMarkCellClass)}>
          <CategoryTableCell
            label={row.original.category_label}
            color={row.original.category_color}
            icon={row.original.category_icon}
            categoryId={row.original.category}
            viewerRole={viewerRole}
            linkEnabled={resolveCategoryLinkEnabled(linkPolicy)}
            markVariant="brand"
            markSize="compact"
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
        const ownerLinkKind = resolveCalendarOwnerLinkKind(
          viewerRole,
          a.calendar_owner_role,
          linkPolicy
        );
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
              linkKind={ownerLinkKind}
              staffRole={a.calendar_owner_role}
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
        const treatRole = a.treating_physician_role ?? "doctor";
        const treatLinkKind = resolveTreatingPhysicianLinkKind(
          viewerRole,
          linkPolicy,
          treatRole
        );
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
              linkKind={treatLinkKind}
              staffRole={treatRole}
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
                clinicalCellMutedTextClass,
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

  return columns.filter((col) => {
    const id = col.id;
    if (!id || typeof id !== "string") return true;
    return !hidden.has(id as RelatedAppointmentsColumnId);
  });
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
              <div className="min-w-0 space-y-0.5">
                <span>{row.original.description!.trim()}</span>
                <InvoiceVisitSummaryLine summary={row.original.visit_summary} />
              </div>
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
          <InvoiceStatusBadge
            invoice={{
              status: row.original.status,
              payments: row.original.payments,
            }}
          />
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
                clinicalCellMutedTextClass
              )}
            >
              {format(new Date(row.original.due_date!), "MMM d, yyyy")}
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
                clinicalCellMutedTextClass
              )}
            >
              {format(new Date(row.original.paid_at!), "MMM d, yyyy")}
            </div>
          ),
          "table"
        ),
    },
  ];
}
