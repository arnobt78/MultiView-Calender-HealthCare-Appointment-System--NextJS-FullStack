"use client";

import Link from "next/link";
import { Stethoscope, User } from "lucide-react";
import { InvoiceVisitMetaLine } from "@/components/shared/billing/InvoiceVisitMetaLine";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import { PatientAgeGlassBadge } from "@/components/shared/person-display/PatientAgeGlassBadge";
import { PatientCareTierGlassBadge } from "@/components/shared/person-display/PatientCareTierGlassBadge";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { DoctorIdentityCell } from "@/components/shared/person-display/DoctorIdentityCell";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import { invoiceAppointmentOptionToDialogDisplay } from "@/lib/invoice-dialog-visit-display";
import {
  resolveCalendarOwnerLinkKind,
  resolveTreatingPhysicianLinkKind,
} from "@/lib/entity-detail-snapshot-links";
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
 * Visit picker tile — patient-first layout; mirrors collapsed summary card parity.
 */
export function InvoiceVisitDirectoryPickerCard({
  option,
  selected,
  disabled = false,
  viewerRole,
  onSelect,
}: Props) {
  const rowDisabled = disabled || !option.eligible;
  const display = invoiceAppointmentOptionToDialogDisplay(option);
  const patientPortrait = display.patientPortrait ?? {
    id: option.id,
    email: null,
    clinical_profile: null,
    birth_date: null,
    firstname: display.patientLabel.split(" ")[0],
    lastname: display.patientLabel.split(" ").slice(1).join(" "),
  };

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
          patient={patientPortrait}
          sizeClassName="h-14 w-14 min-h-[3.5rem] shrink-0 self-stretch rounded-xl"
          className="rounded-xl ring-2 ring-violet-200/60"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-gray-700">
              {display.patientLabel}
            </span>
            {display.birthDate ? (
              <PatientAgeGlassBadge
                age={patientAgeYears(display.birthDate) ?? 0}
                compact
              />
            ) : null}
            {display.isTelehealth ? <TelehealthSessionBadge /> : null}
            {display.patientCareLevel != null ? (
              <PatientCareTierGlassBadge careLevel={display.patientCareLevel} compact />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-xs font-medium text-gray-700">{display.title}</span>
            {display.categoryLabel ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200/60 bg-violet-50/80 px-2 py-0.5 text-[10px] font-normal text-violet-900">
                <CategoryBrandMark color={display.categoryColor} size="compact" />
                {display.categoryLabel}
              </span>
            ) : null}
          </div>
          <InvoiceVisitMetaLine source={display.visitMeta} variant="icons" className="text-xs" />
          {display.treating ? (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                <Stethoscope className="h-2.5 w-2.5 text-violet-600" aria-hidden />
                Treating
              </span>
              <DoctorIdentityCell
                doctorId={display.treating.id}
                name={display.treating.name}
                email={display.treating.email}
                image={display.treating.image}
                specialty={display.treating.specialty}
                viewerRole={viewerRole}
                staffRole={display.treating.role}
                linkKind={resolveTreatingPhysicianLinkKind(
                  viewerRole,
                  undefined,
                  display.treating.role
                )}
                size="sm"
                layout="inline"
                showRoleBadge
                showSpecialty
              />
            </div>
          ) : null}
          {display.owner ? (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                <User className="h-2.5 w-2.5 text-violet-600" aria-hidden />
                Owner
              </span>
              <DoctorIdentityCell
                doctorId={display.owner.id}
                name={display.owner.name}
                email={display.owner.email}
                image={display.owner.image}
                specialty={display.owner.specialty}
                viewerRole={viewerRole}
                staffRole={display.owner.role}
                linkKind={resolveCalendarOwnerLinkKind(viewerRole, display.owner.role)}
                size="sm"
                layout="inline"
                showRoleBadge
                showSpecialty
              />
            </div>
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
