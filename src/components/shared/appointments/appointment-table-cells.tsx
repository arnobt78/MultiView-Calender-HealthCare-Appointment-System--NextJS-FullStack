"use client";

import { format } from "date-fns";
import { Clock, MapPin } from "lucide-react";
import { CategoryTableCell } from "@/components/control-panel/patient-detail-snapshot-columns";
import { AppointmentListVisitFeeBadge } from "@/components/shared/appointment-display/AppointmentListVisitFeeBadge";
import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
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
import { appointmentDetailHref, patientDetailHref, type EntityRole } from "@/lib/entity-routes";
import {
  clinicalCellMutedTextClass,
  clinicalTableCellMinRowClass,
  clinicalTableCellWrapClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

type DoctorLookup = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  image?: string | null;
  specialty?: string | null;
};

/** Clickable title — wraps on narrow columns. */
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
        "flex min-w-0 items-center py-0.5"
      )}
    >
      <EntityTitleLink
        href={href}
        label={label}
        className="min-w-0 font-normal"
        wrapLabel
      />
    </div>
  );
}

/** Status + visit fee + invoice/payment badges — calendar/AppointmentCard billing parity. */
export function AppointmentManagementStatusCell({
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
      <AppointmentStatusGlassBadge status={appointment.status} size="compact" />
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

  return (
    <div className={cn(clinicalTableCellMinRowClass, "flex min-w-0 flex-col gap-0.5 py-0.5")}>
      <span
        className={cn(
          "inline-flex min-w-0 items-center gap-1 tabular-nums",
          clinicalCellMutedTextClass
        )}
      >
        <Clock className="h-3 w-3 shrink-0" aria-hidden />
        {format(start, "dd MMM yyyy, HH:mm")}
        <span className="mx-0.5">–</span>
        {format(end, "HH:mm")}
      </span>
      <span
        className={cn(
          "inline-flex min-w-0 items-start gap-1 break-words [overflow-wrap:break-word]",
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

/** Brand category mark + linked label + duration badge (Category Management parity). */
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

  return (
    <div
      className={cn(
        clinicalTableCellMinRowClass,
        "inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 py-0.5"
      )}
    >
      <CategoryTableCell
        label={cat.label}
        color={cat.color}
        icon={cat.icon}
        categoryId={cat.id}
        viewerRole={viewerRole}
        markVariant="brand"
        markSize="compact"
      />
      <CategoryDurationMinutesBadge minutes={durationMinutes} />
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
