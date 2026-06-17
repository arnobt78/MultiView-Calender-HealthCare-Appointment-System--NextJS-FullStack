"use client";

import { format } from "date-fns";
import { Clock, MapPin } from "lucide-react";
import { AppointmentListVisitFeeBadge } from "@/components/shared/appointment-display/AppointmentListVisitFeeBadge";
import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";
import { CategoryDurationMinutesBadge } from "@/components/shared/category-display/CategoryDurationMinutesBadge";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { PaymentStatusBadge } from "@/components/shared/billing/PaymentStatusBadge";
import { DoctorIdentityCell } from "@/components/shared/person-display/DoctorIdentityCell";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import type { FullAppointment } from "@/hooks/useAppointments";
import { resolveAppointmentTypeDurationMinutes } from "@/lib/appointment-type-display";
import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import type { InvoiceRow } from "@/lib/billing-types";
import { resolveLatestInvoicePayment, resolveAppointmentListBillingBadges } from "@/lib/appointment-invoice-lookup";
import { appointmentDetailHref, categoryDetailHref, patientDetailHref, type EntityRole } from "@/lib/entity-routes";
import {
  clinicalCellMutedTextClass,
  clinicalTableCellMinRowClass,
  clinicalTableCellWrapClass,
} from "@/lib/table-display-styles";
import {
  clinicalIdentityCompactStackRowClass,
} from "@/lib/clinical-identity-inline-ui";
import { cn } from "@/lib/utils";

type DoctorLookup = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  image?: string | null;
  specialty?: string | null;
};

/** Clickable title + inline visit status badge (same row rhythm as patient name row). */
export function AppointmentTitleTableCell({
  appointment,
  viewerRole,
}: {
  appointment: FullAppointment;
  viewerRole: EntityRole;
}) {
  const href = appointmentDetailHref(viewerRole, appointment.id);
  const label = appointment.title?.trim() || "Untitled";

  return (
    <div
      className={cn(
        clinicalTableCellMinRowClass,
        clinicalTableCellWrapClass,
        "flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 py-0.5"
      )}
    >
      <EntityTitleLink
        href={href}
        label={label}
        className="min-w-0 font-normal"
        wrapLabel
      />
      <AppointmentStatusGlassBadge
        status={appointment.status}
        size="compact"
        className="shrink-0"
      />
    </div>
  );
}

/** Visit fee + invoice/payment badges — appointment status lives on title row. */
export function AppointmentManagementBillingCell({
  appointment,
  invoiceDisplayStatus,
  invoice,
}: {
  appointment: FullAppointment;
  invoiceDisplayStatus?: InvoiceDisplayStatus | null;
  invoice?: InvoiceRow | null;
}) {
  const latestPayment = resolveLatestInvoicePayment(invoice?.payments);
  const { showInvoice, showPayment } = resolveAppointmentListBillingBadges({
    invoiceDisplayStatus,
    latestPaymentStatus: latestPayment?.status,
  });

  return (
    <div
      className={cn(
        clinicalTableCellMinRowClass,
        "flex min-w-0 flex-col items-start gap-1 py-0.5"
      )}
    >
      <AppointmentListVisitFeeBadge
        size="table"
        appointmentTypePriceCents={appointment.appointment_type_price_cents}
        doctorConsultationFeeCents={appointment.doctor_consultation_fee_cents}
      />
      {showInvoice && invoiceDisplayStatus ? (
        <InvoiceStatusBadge displayStatus={invoiceDisplayStatus} />
      ) : null}
      {showPayment && latestPayment ? (
        <PaymentStatusBadge status={latestPayment.status} />
      ) : null}
    </div>
  );
}

/** Muted datetime + location rows with Clock/MapPin icons. */
export function AppointmentWhenTableCell({ appointment }: { appointment: FullAppointment }) {
  const start = new Date(appointment.start);
  const end = new Date(appointment.end);
  const location = appointment.location?.trim();
  const whenLabel = `${format(start, "dd MMM yyyy, HH:mm")} – ${format(end, "HH:mm")}`;

  return (
    <div className={cn(clinicalTableCellMinRowClass, "flex min-w-0 flex-col gap-0.5 py-0.5")}>
      <span
        className={cn(
          "inline-flex max-w-full min-w-0 items-start gap-1 self-start",
          clinicalCellMutedTextClass
        )}
      >
        <Clock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        <span className="min-w-0 break-words tabular-nums [overflow-wrap:break-word]">
          {whenLabel}
        </span>
      </span>
      <span
        className={cn(
          "inline-flex max-w-full min-w-0 items-start gap-1 self-start break-words [overflow-wrap:break-word]",
          clinicalCellMutedTextClass
        )}
      >
        <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        {location || "—"}
      </span>
    </div>
  );
}

function resolveCategoryDurationMinutes(appointment: FullAppointment): number | null {
  const fromCategory = appointment.category_data?.duration_minutes_default;
  if (typeof fromCategory === "number" && fromCategory > 0) return fromCategory;
  return resolveAppointmentTypeDurationMinutes(appointment);
}

/** Category compactStack — brand mark + inline label + duration badge (title row parity). */
export function AppointmentCategoryTableCell({
  appointment,
  viewerRole,
}: {
  appointment: FullAppointment;
  viewerRole: EntityRole;
}) {
  const cat = appointment.category_data;
  if (!cat) {
    return <span className={cn(clinicalCellMutedTextClass, "text-xs")}>—</span>;
  }
  const durationMinutes = resolveCategoryDurationMinutes(appointment);
  const label = cat.label.trim();

  return (
    <div
      className={cn(
        clinicalIdentityCompactStackRowClass,
        clinicalTableCellMinRowClass,
        "py-0.5"
      )}
    >
      <CategoryBrandMark
        color={cat.color}
        icon={cat.icon}
        variant="brand"
        size="compact"
      />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1">
        <EntityTitleLink
          href={categoryDetailHref(viewerRole, cat.id)}
          label={label}
          className="min-w-0 shrink font-normal"
          wrapLabel
        />
        <CategoryDurationMinutesBadge minutes={durationMinutes} className="shrink-0" />
      </div>
    </div>
  );
}

export function AppointmentPatientTableCell({
  appointment,
  viewerRole,
}: {
  appointment: FullAppointment;
  viewerRole: EntityRole;
}) {
  const p = appointment.patient_data;
  if (!p) {
    return <span className={cn(clinicalCellMutedTextClass, "text-xs")}>—</span>;
  }
  const name = `${p.firstname ?? ""} ${p.lastname ?? ""}`.trim() || "—";
  return (
    <PatientIdentityCell
      href={patientDetailHref(viewerRole, p.id)}
      name={name}
      email={p.email}
      patient={p}
      layout="compactStack"
      avatarSizeClassName="h-6 w-6"
      careLevel={p.care_level}
      className="min-h-0 py-0"
    />
  );
}

export function AppointmentTreatingTableCell({
  appointment,
  viewerRole,
  doctorById,
}: {
  appointment: FullAppointment;
  viewerRole: EntityRole;
  doctorById: Map<string, DoctorLookup>;
}) {
  const doctorId = appointment.treating_physician_id?.trim();
  if (!doctorId) {
    return <span className={cn(clinicalCellMutedTextClass, "text-xs")}>—</span>;
  }
  const fromMap = doctorById.get(doctorId);
  const name =
    fromMap?.display_name?.trim() ||
    fromMap?.email?.trim() ||
    "Treating physician";

  return (
    <DoctorIdentityCell
      doctorId={doctorId}
      name={name}
      email={fromMap?.email}
      image={fromMap?.image}
      specialty={fromMap?.specialty}
      viewerRole={viewerRole}
      linkKind="admin-cp"
      layout="compactStack"
      size="sm"
      showSpecialty
      showRoleBadge={false}
      className="min-h-0 py-0"
    />
  );
}
