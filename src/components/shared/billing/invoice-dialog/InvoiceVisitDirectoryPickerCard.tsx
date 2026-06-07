"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { InvoiceVisitMetaLine } from "@/components/shared/billing/InvoiceVisitMetaLine";
import { invoiceAppointmentOptionToMetaInput } from "@/lib/invoice-visit-meta-line";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import { PatientAgeGlassBadge } from "@/components/shared/person-display/PatientAgeGlassBadge";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { DoctorMiniAvatar } from "@/components/shared/doctor-display/DoctorMiniAvatar";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import {
  invoiceDialogGlassTileClass,
  invoiceDialogGlassTileSelectedClass,
} from "@/lib/invoice-dialog-ui-classes";
import { invoiceDetailHref } from "@/lib/entity-routes";
import type { EntityRole } from "@/lib/entity-routes";
import { patientAgeYears } from "@/lib/patient-age";
import { cn } from "@/lib/utils";

type Props = {
  option: InvoiceAppointmentOptionRow;
  selected: boolean;
  disabled?: boolean;
  viewerRole: EntityRole;
  onSelect: () => void;
};

/**
 * Visit picker tile — patient-first layout (no curated slug title); mirrors doctor directory cards.
 */
export function InvoiceVisitDirectoryPickerCard({
  option,
  selected,
  disabled = false,
  viewerRole,
  onSelect,
}: Props) {
  const rowDisabled = disabled || !option.eligible;

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
          "flex w-full items-stretch gap-3 p-3 text-left",
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
          sizeClassName="h-14 w-14 min-h-[3.5rem] shrink-0 self-stretch rounded-xl"
          className="rounded-xl ring-2 ring-violet-200/60"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
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
          <div className="flex flex-wrap items-center gap-1.5">
            {option.appointment_type_name ? (
              <span className="rounded-full border border-sky-200/60 bg-sky-50/80 px-2 py-0.5 text-[10px] font-normal text-sky-900">
                {option.appointment_type_name}
              </span>
            ) : null}
            {option.category_label ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200/60 bg-violet-50/80 px-2 py-0.5 text-[10px] font-normal text-violet-900">
                <CategoryBrandMark color={option.category_color} size="compact" />
                {option.category_label}
              </span>
            ) : null}
          </div>
          <InvoiceVisitMetaLine
            source={invoiceAppointmentOptionToMetaInput(option)}
            variant="text"
          />
          {option.treating_physician_label ? (
            <div className="flex items-center gap-1.5 text-[10px] text-gray-700">
              <DoctorMiniAvatar
                doctor={{
                  id: option.treating_physician_id ?? option.owner_id,
                  display_name: option.treating_physician_label,
                  email: null,
                  image: null,
                }}
                className="h-6 w-6"
              />
              <span className="font-medium">{option.treating_physician_label}</span>
              {option.treating_physician_specialty ? (
                <DoctorSpecialtyBadge specialty={option.treating_physician_specialty} />
              ) : null}
            </div>
          ) : null}
          {option.calendar_owner_label &&
          option.calendar_owner_label !== option.treating_physician_label ? (
            <p className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <User className="h-3 w-3" aria-hidden />
              Owner: {option.calendar_owner_label}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 self-start">
          {option.suggested_amount_cents != null ? (
            <InvoiceAmountDisplay
              amountCents={option.suggested_amount_cents}
              currency={option.currency ?? "eur"}
              className="text-xs"
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
            className="text-violet-800 underline"
            onClick={(e) => e.stopPropagation()}
          >
            View invoice
          </Link>
        </p>
      ) : null}
    </div>
  );
}
