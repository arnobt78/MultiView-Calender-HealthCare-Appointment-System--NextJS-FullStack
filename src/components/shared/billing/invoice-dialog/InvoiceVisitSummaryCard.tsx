"use client";

import { ChevronDown, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import { PatientAgeGlassBadge } from "@/components/shared/person-display/PatientAgeGlassBadge";
import { PatientCareTierGlassBadge } from "@/components/shared/person-display/PatientCareTierGlassBadge";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { AppointmentTypeGlassBadge } from "@/components/shared/appointment-display/AppointmentTypeGlassBadge";
import { DoctorIdentityCell } from "@/components/shared/person-display/DoctorIdentityCell";
import { InvoiceVisitMetaLine } from "@/components/shared/billing/InvoiceVisitMetaLine";
import type { InvoiceAppointmentOptionRow, InvoiceVisitSummary } from "@/lib/billing-types";
import {
  invoiceAppointmentOptionToDialogDisplay,
  invoiceVisitSummaryToDialogDisplay,
} from "@/lib/invoice-dialog-visit-display";
import {
  resolveCalendarOwnerLinkKind,
  resolveTreatingPhysicianLinkKind,
} from "@/lib/entity-detail-snapshot-links";
import type { EntityRole } from "@/lib/entity-routes";
import { patientAgeYears } from "@/lib/patient-age";
import { buildInvoiceVisitFeeStripLine } from "@/lib/appointment-visit-fee-display";
import { invoiceDialogSummaryCardClass } from "@/lib/invoice-dialog-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  viewerRole: EntityRole;
  onChangeVisit?: () => void;
  className?: string;
} & (
    | { source: "option"; visit: InvoiceAppointmentOptionRow }
    | { source: "summary"; visit: InvoiceVisitSummary }
  );

/** Collapsed selected visit — create mode after pick; edit mode read-only linked visit. */
export function InvoiceVisitSummaryCard(props: Props) {
  const { viewerRole, onChangeVisit, className, source, visit } = props;
  const display =
    source === "summary"
      ? invoiceVisitSummaryToDialogDisplay(visit)
      : invoiceAppointmentOptionToDialogDisplay(visit);

  const age = display.birthDate ? patientAgeYears(display.birthDate) : null;
  const patientPortrait = display.patientPortrait ?? {
    id: source === "summary" ? visit.appointment_id : visit.id,
    email: null,
    clinical_profile: null,
    birth_date: null,
    firstname: display.patientLabel.split(" ")[0],
    lastname: display.patientLabel.split(" ").slice(1).join(" "),
  };

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
            <span className="text-base font-semibold text-gray-800">{display.patientLabel}</span>
            {age != null ? <PatientAgeGlassBadge age={age} /> : null}
            {display.isTelehealth ? <TelehealthSessionBadge /> : null}
            {display.patientCareLevel != null ? (
              <PatientCareTierGlassBadge careLevel={display.patientCareLevel} />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-medium text-gray-700">{display.title}</p>
            {display.appointmentTypeName ? (
              <AppointmentTypeGlassBadge
                name={display.appointmentTypeName}
                durationLabel={display.typeDurationLabel}
              />
            ) : null}
          </div>
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

      <InvoiceVisitMetaLine source={display.visitMeta} variant="icons" />

      <div className="flex flex-wrap gap-2">
        {display.categoryLabel ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-200/60 bg-white/90 px-2.5 py-0.5 text-xs font-normal text-violet-900">
            <CategoryBrandMark color={display.categoryColor} size="compact" />
            {display.categoryLabel}
          </span>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {display.treating ? (
          <div className="space-y-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <Stethoscope className="h-3 w-3 text-violet-600" aria-hidden />
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
            <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <User className="h-3 w-3 text-violet-600" aria-hidden />
              Calendar owner
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

      {display.visitFeeInput ? (
        <p className="text-[11px] leading-snug text-muted-foreground">
          {buildInvoiceVisitFeeStripLine(display.visitFeeInput)}
        </p>
      ) : null}
    </div>
  );
}
