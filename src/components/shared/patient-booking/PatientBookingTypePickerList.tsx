"use client";

/**
 * Patient booking step 1 — re-exports shared `VisitTypePickerList` with wizard types.
 */

import {
  VisitTypePickerList,
  type VisitTypePickerItem,
} from "@/components/shared/scheduling/VisitTypePickerList";
import type { FlexDurationMinutes } from "@/lib/scheduling/flexible-type-config";
import type { PatientBookingAppointmentType } from "@/lib/patient-booking-wizard";

type PatientBookingTypePickerListProps = {
  typesLoading: boolean;
  isFlexible: boolean;
  types: PatientBookingAppointmentType[];
  selectedType: PatientBookingAppointmentType | null;
  onSelectType: (type: PatientBookingAppointmentType) => void;
  flexDuration: number;
  onFlexDurationChange: (minutes: number) => void;
  fillLayout?: boolean;
  className?: string;
  doctorConsultationFeeCents?: number | null;
  inactiveTypes?: PatientBookingAppointmentType[];
};

export function PatientBookingTypePickerList(props: PatientBookingTypePickerListProps) {
  const {
    types,
    selectedType,
    onSelectType,
    flexDuration,
    onFlexDurationChange,
    inactiveTypes,
    ...rest
  } = props;

  return (
    <VisitTypePickerList
      {...rest}
      types={types as VisitTypePickerItem[]}
      selectedType={selectedType as VisitTypePickerItem | null}
      onSelectType={onSelectType as (t: VisitTypePickerItem) => void}
      flexDuration={flexDuration as FlexDurationMinutes}
      onFlexDurationChange={onFlexDurationChange as (m: FlexDurationMinutes) => void}
      inactiveTypes={inactiveTypes as VisitTypePickerItem[] | undefined}
    />
  );
}
