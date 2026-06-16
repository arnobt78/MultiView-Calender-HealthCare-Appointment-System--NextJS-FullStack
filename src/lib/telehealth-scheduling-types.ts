/**
 * Telehealth-only visit type partition for queue booking preset (REQ-0091).
 * Selectable = doctor-enabled telehealth types; inactiveDisplay = telehealth but disabled/inactive.
 */

import {
  filterBookableTypesForDoctorFromApi,
  type AppointmentTypeDoctorApiRow,
} from "@/lib/doctor-bookable-types";

export type TelehealthTypesPartition = {
  selectable: AppointmentTypeDoctorApiRow[];
  inactiveDisplay: AppointmentTypeDoctorApiRow[];
};

function isTelehealthType(row: AppointmentTypeDoctorApiRow): boolean {
  return row.is_telehealth === true;
}

function isBookableTelehealthForDoctor(
  doctorId: string,
  row: AppointmentTypeDoctorApiRow
): boolean {
  return filterBookableTypesForDoctorFromApi(doctorId, [row]).length > 0;
}

/** Splits raw API rows into enabled telehealth (selectable) vs disabled telehealth (display-only). */
export function partitionTelehealthTypesForDoctorFromApi(
  doctorId: string,
  types: AppointmentTypeDoctorApiRow[]
): TelehealthTypesPartition {
  const telehealthRows = types.filter(isTelehealthType);
  const selectable: AppointmentTypeDoctorApiRow[] = [];
  const inactiveDisplay: AppointmentTypeDoctorApiRow[] = [];

  for (const row of telehealthRows) {
    if (isBookableTelehealthForDoctor(doctorId, row)) {
      selectable.push(row);
    } else {
      inactiveDisplay.push(row);
    }
  }

  const byName = (a: AppointmentTypeDoctorApiRow, b: AppointmentTypeDoctorApiRow) =>
    a.name.localeCompare(b.name);
  selectable.sort(byName);
  inactiveDisplay.sort(byName);

  return { selectable, inactiveDisplay };
}

/** First enabled telehealth type — auto-select when opening telehealth booking preset. */
export function resolveDefaultTelehealthTypeId(
  selectable: AppointmentTypeDoctorApiRow[]
): string {
  return selectable[0]?.id ?? "";
}
