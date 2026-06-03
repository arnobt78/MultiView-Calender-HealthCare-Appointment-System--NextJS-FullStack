"use client";

import Link from "next/link";
import { MapPin, Stethoscope, User } from "lucide-react";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import { PatientAgeGlassBadge } from "@/components/shared/person-display/PatientAgeGlassBadge";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import { formatInvoiceVisitPickerMeta } from "@/lib/invoice-appointment-option-display";
import { patientAgeYears } from "@/lib/patient-age";
import {
  invoiceDialogGlassTileClass,
  invoiceDialogGlassTileSelectedClass,
} from "@/lib/invoice-dialog-ui-classes";
import { invoiceDetailHref } from "@/lib/entity-routes";
import type { EntityRole } from "@/lib/entity-routes";
import { cn } from "@/lib/utils";

type Props = {
  option: InvoiceAppointmentOptionRow;
  selected: boolean;
  disabled?: boolean;
  viewerRole: EntityRole;
  onSelect: () => void;
};

/** Rich visit tile for invoice create picker — portrait, badges, doctors, category, billing state. */
export function InvoiceVisitPickerCard({
  option,
  selected,
  disabled = false,
  viewerRole,
  onSelect,
}: Props) {
  const rowDisabled = disabled || !option.eligible;
  const metaLine = formatInvoiceVisitPickerMeta(option);

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={rowDisabled}
        onClick={() => {
          if (!rowDisabled) onSelect();
        }}
        className={cn(
          invoiceDialogGlassTileClass,
          "flex gap-3 p-3",
          selected && option.eligible && invoiceDialogGlassTileSelectedClass,
          rowDisabled && "cursor-not-allowed opacity-60"
        )}
      >
        <PatientPortraitAvatar
          patient={{
            id: option.patient_id ?? option.id,
            email: option.patient_email ?? null,
            firstname: option.patient_label.split(" ")[0],
            lastname: option.patient_label.split(" ").slice(1).join(" "),
            clinical_profile: option.patient_clinical_profile ?? undefined,
          }}
          sizeClassName="h-14 w-14 shrink-0 rounded-xl"
          className="rounded-xl ring-2 ring-amber-200/60"
        />
        <div className="min-w-0 flex-1 space-y-1.5 text-left">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-gray-800">
              {option.patient_label}
            </span>
            {option.patient_birth_date ? (
              <PatientAgeGlassBadge
                age={patientAgeYears(option.patient_birth_date) ?? 0}
                compact
              />
            ) : null}
            {option.is_telehealth ? <TelehealthSessionBadge /> : null}
          </div>
          <p className="line-clamp-1 text-xs font-medium text-gray-700">{option.title}</p>
          {metaLine ? (
            <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">{metaLine}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            {option.category_label ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50/80 px-2 py-0.5 text-[10px] font-medium text-amber-900">
                <CategoryBrandMark color={option.category_color} size="compact" />
                {option.category_label}
              </span>
            ) : null}
            {option.appointment_type_name && option.appointment_type_name !== option.category_label ? (
              <span className="rounded-full border border-sky-200/60 bg-sky-50/80 px-2 py-0.5 text-[10px] font-medium text-sky-900">
                {option.appointment_type_name}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
            {option.treating_physician_label ? (
              <span className="inline-flex items-center gap-1">
                <Stethoscope className="h-3 w-3" aria-hidden />
                {option.treating_physician_label}
                {option.treating_physician_specialty
                  ? ` · ${option.treating_physician_specialty}`
                  : ""}
              </span>
            ) : null}
            {option.calendar_owner_label &&
            option.calendar_owner_label !== option.treating_physician_label ? (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden />
                Owner: {option.calendar_owner_label}
              </span>
            ) : null}
            {option.location_label && !option.is_telehealth ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {option.location_label}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 self-start">
          {option.suggested_amount_cents != null && option.currency ? (
            <InvoiceAmountDisplay
              amountCents={option.suggested_amount_cents}
              currency={option.currency}
              className="text-xs font-semibold text-emerald-700"
            />
          ) : option.amount_cents != null && option.currency ? (
            <InvoiceAmountDisplay
              amountCents={option.amount_cents}
              currency={option.currency}
              className="text-xs font-semibold text-gray-700"
            />
          ) : null}
          {option.display_status ? (
            <InvoiceStatusBadge displayStatus={option.display_status} />
          ) : null}
        </div>
      </button>
      {!option.eligible && option.invoice_id ? (
        <p className="px-1 text-[10px] text-muted-foreground">
          {option.block_reason}{" "}
          <Link
            href={invoiceDetailHref(viewerRole, option.invoice_id)}
            className="text-amber-800 underline"
            onClick={(e) => e.stopPropagation()}
          >
            View invoice
          </Link>
        </p>
      ) : null}
    </div>
  );
}
