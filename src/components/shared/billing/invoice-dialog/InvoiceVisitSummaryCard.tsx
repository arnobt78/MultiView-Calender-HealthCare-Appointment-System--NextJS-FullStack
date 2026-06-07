"use client";

import { ChevronDown, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import { PatientAgeGlassBadge } from "@/components/shared/person-display/PatientAgeGlassBadge";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { InvoiceVisitMetaLine } from "@/components/shared/billing/InvoiceVisitMetaLine";
import {
  invoiceAppointmentOptionToMetaInput,
  invoiceVisitSummaryToMetaInput,
} from "@/lib/invoice-visit-meta-line";
import type { InvoiceAppointmentOptionRow, InvoiceVisitSummary } from "@/lib/billing-types";
import type { InvoiceVisitMetaInput } from "@/lib/invoice-visit-meta-line";
import { patientAgeYears } from "@/lib/patient-age";
import { invoiceDialogSummaryCardClass } from "@/lib/invoice-dialog-ui-classes";
import { cn } from "@/lib/utils";

type Props =
  | {
      source: "option";
      visit: InvoiceAppointmentOptionRow;
      onChangeVisit?: () => void;
      className?: string;
    }
  | {
      source: "summary";
      visit: InvoiceVisitSummary;
      onChangeVisit?: () => void;
      className?: string;
    };

/** Collapsed selected visit — create mode after pick; edit mode read-only linked visit. */
export function InvoiceVisitSummaryCard(props: Props) {
  const { onChangeVisit, className } = props;

  if (props.source === "summary") {
    return (
      <SummaryFromVisitSummary
        visit={props.visit}
        onChangeVisit={onChangeVisit}
        className={className}
      />
    );
  }

  return (
    <SummaryFromOption
      visit={props.visit}
      onChangeVisit={onChangeVisit}
      className={className}
    />
  );
}

function SummaryFromOption({
  visit,
  onChangeVisit,
  className,
}: {
  visit: InvoiceAppointmentOptionRow;
  onChangeVisit?: () => void;
  className?: string;
}) {
  const patientLabel = visit.patient_label;

  return (
    <SummaryShell
      onChangeVisit={onChangeVisit}
      className={className}
      patientPortrait={{
        id: visit.patient_id ?? visit.id,
        email: visit.patient_email ?? null,
        firstname: patientLabel.split(" ")[0],
        lastname: patientLabel.split(" ").slice(1).join(" "),
        clinical_profile: visit.patient_clinical_profile ?? null,
      }}
      birthDate={visit.patient_birth_date}
      isTelehealth={visit.is_telehealth}
      patientLabel={patientLabel}
      title={visit.title}
      visitMeta={invoiceAppointmentOptionToMetaInput(visit)}
      categoryLabel={visit.category_label}
      categoryColor={visit.category_color}
      treatingLabel={visit.treating_physician_label}
      treatingSpecialty={visit.treating_physician_specialty}
      ownerLabel={visit.calendar_owner_label}
    />
  );
}

function SummaryFromVisitSummary({
  visit,
  onChangeVisit,
  className,
}: {
  visit: InvoiceVisitSummary;
  onChangeVisit?: () => void;
  className?: string;
}) {
  const patientLabel = visit.patient_label ?? "Patient";

  return (
    <SummaryShell
      onChangeVisit={onChangeVisit}
      className={className}
      patientPortrait={{
        id: visit.patient_id ?? visit.appointment_id,
        email: visit.patient_email ?? null,
        firstname: patientLabel.split(" ")[0],
        lastname: patientLabel.split(" ").slice(1).join(" "),
        clinical_profile: null,
      }}
      birthDate={visit.patient_birth_date}
      isTelehealth={visit.is_telehealth}
      patientLabel={patientLabel}
      title={visit.title}
      visitMeta={invoiceVisitSummaryToMetaInput(visit)}
      categoryLabel={visit.category_label}
      categoryColor={visit.category_color}
      treatingLabel={visit.treating_physician_label}
      treatingSpecialty={visit.treating_physician_specialty}
      ownerLabel={visit.calendar_owner_label}
    />
  );
}

function SummaryShell({
  onChangeVisit,
  className,
  patientPortrait,
  birthDate,
  isTelehealth,
  patientLabel,
  title,
  visitMeta,
  categoryLabel,
  categoryColor,
  treatingLabel,
  treatingSpecialty,
  ownerLabel,
}: {
  onChangeVisit?: () => void;
  className?: string;
  patientPortrait: {
    id: string;
    email: string | null;
    firstname: string;
    lastname: string;
    clinical_profile: { image_url?: string } | null;
  };
  birthDate?: string | null;
  isTelehealth?: boolean;
  patientLabel: string;
  title: string;
  visitMeta: InvoiceVisitMetaInput;
  categoryLabel?: string | null;
  categoryColor?: string | null;
  treatingLabel?: string | null;
  treatingSpecialty?: string | null;
  ownerLabel?: string | null;
}) {
  const age = birthDate ? patientAgeYears(birthDate) : null;

  return (
    <div className={cn(invoiceDialogSummaryCardClass, "space-y-3", className)}>
      <div className="flex items-start gap-3">
        <PatientPortraitAvatar
          patient={patientPortrait}
          sizeClassName="h-16 w-16 shrink-0 rounded-xl"
          className="rounded-xl ring-2 ring-violet-300/50"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-base font-semibold text-gray-800">{patientLabel}</span>
            {age != null ? <PatientAgeGlassBadge age={age} /> : null}
            {isTelehealth ? <TelehealthSessionBadge /> : null}
          </div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
        </div>
        {onChangeVisit ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1 rounded-full text-violet-800 hover:bg-violet-100/80"
            onClick={onChangeVisit}
          >
            Change visit
            <ChevronDown className="h-4 w-4" aria-hidden />
          </Button>
        ) : null}
      </div>

      <InvoiceVisitMetaLine source={visitMeta} variant="icons" />

      <div className="flex flex-wrap gap-2">
        {categoryLabel ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-200/60 bg-white/90 px-2.5 py-0.5 text-xs font-normal text-violet-900">
            <CategoryBrandMark color={categoryColor} size="compact" />
            {categoryLabel}
          </span>
        ) : null}
      </div>

      <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        {treatingLabel ? (
          <span className="inline-flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5 shrink-0 text-violet-600" aria-hidden />
            <span>
              Treating: <span className="font-medium text-gray-700">{treatingLabel}</span>
              {treatingSpecialty ? ` · ${treatingSpecialty}` : ""}
            </span>
          </span>
        ) : null}
        {ownerLabel && ownerLabel !== treatingLabel ? (
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0 text-violet-600" aria-hidden />
            <span>
              Calendar owner: <span className="font-medium text-gray-700">{ownerLabel}</span>
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
